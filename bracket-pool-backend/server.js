const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection (SQLite)
const db = new sqlite3.Database('./bracketPool.db', (err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Helper function to run queries
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('DB Error in runQuery:', err.message); // More detailed logging
                console.error('Query:', query);
                console.error('Params:', params);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Helper function for INSERT/UPDATE/DELETE queries
const runExec = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) { // Use 'function' for 'this.lastID'
            if (err) {
                console.error('DB Error in runExec:', err.message); // More detailed logging
                console.error('Query:', query);
                console.error('Params:', params);
                reject(err);
            } else {
                resolve({ insertId: this.lastID, changes: this.changes });
            }
        });
    });
};

// --- Existing Routes ---

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, email, password, name } = req.body;
    if (!username || !email || !password || !name) {
        return res.status(400).json({ error: 'All fields are required for registration.' });
    }
    try {
        // It's highly recommended to hash passwords before storing them.
        // For simplicity, this example continues with plain text as in the original.
        const result = await runExec(
            'INSERT INTO Users (Username, Email, Password, Name) VALUES (?, ?, ?, ?)',
            [username, email, password, name]
        );
        res.status(201).json({ userId: result.insertId, username: username });
    } catch (err) {
        console.error('Registration error:', err);
        if (err.message && err.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed: Users.Email')) {
            return res.status(409).json({ error: 'Email already exists.' });
        }
        if (err.message && err.message.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed: Users.Username')) {
            return res.status(409).json({ error: 'Username already exists.' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const users = await runQuery('SELECT UserID, Username, Password FROM Users WHERE Email = ?', [email]);
        const user = users[0];
        // IMPORTANT: Plain text password comparison is insecure. Use bcrypt in a real app.
        if (user && user.Password === password) {
            res.json({ userId: user.UserID, username: user.Username });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get Tournaments
app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await runQuery('SELECT TournamentID, Name, StartDate, EndDate FROM Tournaments');
        res.json(tournaments);
    } catch (err) {
        console.error('Fetch tournaments error:', err);
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});

// Get Teams for a Tournament
app.get('/api/tournaments/:id/teams', async (req, res) => {
    const { id } = req.params;
    try {
        const teams = await runQuery(
            'SELECT TeamID, TournamentID, Name, Seed, Region FROM Teams WHERE TournamentID = ? ORDER BY Seed, Region',
            [id]
        );
        res.json(teams);
    } catch (err) {
        console.error(`Workspace teams for tournament ${id} error:`, err);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Get Games for a Tournament
app.get('/api/tournaments/:id/games', async (req, res) => {
    const { id } = req.params;
    try {
        const games = await runQuery(
            'SELECT GameID, TournamentID, GameNumber, Team1ID, Team2ID, WinnerID, GameDate, PossiblePoints FROM Games WHERE TournamentID = ? ORDER BY GameNumber',
            [id]
        );
        res.json(games);
    } catch (err) {
        console.error(`Workspace games for tournament ${id} error:`, err);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

// Submit a Bracket
app.post('/api/brackets', async (req, res) => {
    const { userId, tournamentId, name, picks } = req.body;
    if (!userId || !tournamentId || !name || !picks || !Array.isArray(picks)) {
        return res.status(400).json({ error: 'Missing required fields for bracket submission.' });
    }
    try {
        const bracketResult = await runExec(
            'INSERT INTO Brackets (UserID, TournamentID, Name, Score, PossiblePoints) VALUES (?, ?, ?, 0, 0)', // Assuming Score and PossiblePoints start at 0
            [userId, tournamentId, name]
        );
        const bracketId = bracketResult.insertId;

        // Use a transaction for inserting multiple picks
        await runExec('BEGIN TRANSACTION');
        try {
            for (const pick of picks) {
                if (pick.gameId == null || pick.predictedWinnerId == null) { // check for null or undefined
                    console.warn('Skipping pick with null gameId or predictedWinnerId:', pick);
                    continue;
                }
                await runExec(
                    'INSERT INTO BracketPicks (BracketID, GameID, PredictedWinnerID, IsCorrect) VALUES (?, ?, ?, 0)', // Assuming IsCorrect starts at 0 (false)
                    [bracketId, pick.gameId, pick.predictedWinnerId]
                );
            }
            await runExec('COMMIT');
            res.status(201).json({ bracketId });
        } catch (transactionError) {
            await runExec('ROLLBACK');
            console.error('Bracket picks transaction error:', transactionError);
            // It's good practice to delete the partially created bracket if picks fail
            await runExec('DELETE FROM Brackets WHERE BracketID = ?', [bracketId]);
            throw transactionError; // Re-throw to be caught by outer catch
        }
    } catch (err) {
        console.error('Create bracket error:', err);
        res.status(500).json({ error: 'Failed to create bracket' });
    }
});

// Get Pools
app.get('/api/pools', async (req, res) => {
    try {
        const pools = await runQuery('SELECT PoolID, AdminID, TournamentID, Name, Description, Privacy, EntryFee FROM Pools');
        res.json(pools);
    } catch (err) {
        console.error('Fetch pools error:', err);
        res.status(500).json({ error: 'Failed to fetch pools' });
    }
});

// Create a Pool
// Create a Pool
app.post('/api/pools', async (req, res) => {
    // Good practice to log what the server receives, especially during debugging
    console.log('Received request to /api/pools with body:', req.body);

    const { adminId, tournamentId, name, description, privacy, entryFee = 0 } = req.body;

    // --- CORRECTED VALIDATION ---
    if (!adminId) {
        return res.status(400).json({ error: 'AdminID is required.' });
    }
    if (!tournamentId && tournamentId !== 0) { // Allow 0 if it's a valid ID, otherwise just !tournamentId
        return res.status(400).json({ error: 'TournamentID is required.' });
    }
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required and cannot be empty.' });
    }
    // Check if privacy is explicitly a boolean, as per your schema
    if (typeof privacy !== 'boolean') {
        return res.status(400).json({ error: 'Privacy setting is required and must be a boolean (true or false).' });
    }
    // EntryFee has a default and description is optional, so no strict check needed unless you want to.

    try {
        const result = await runExec(
            'INSERT INTO Pools (AdminID, TournamentID, Name, Description, Privacy, EntryFee) VALUES (?, ?, ?, ?, ?, ?)',
            // SQLite will handle boolean false as 0 and true as 1 for a BOOLEAN column
            [adminId, tournamentId, name, description, privacy, entryFee]
        );
        // Fetch the newly created pool to return it (optional but good practice)
        const newPoolArray = await runQuery('SELECT * FROM Pools WHERE PoolID = ?', [result.insertId]);
        if (newPoolArray.length > 0) {
            res.status(201).json(newPoolArray[0]); // Return the full new pool object
        } else {
            // Should not happen if insertId is valid, but as a fallback
            res.status(201).json({ poolId: result.insertId });
        }

    } catch (err) {
        console.error('Create pool error:', err);
        res.status(500).json({ error: 'Failed to create pool' });
    }
});

// Join a Pool
app.post('/api/pool-participants', async (req, res) => {
    const { poolId, userId, bracketId } = req.body;
     if (!poolId || !userId || !bracketId) {
        return res.status(400).json({ error: 'PoolID, UserID, and BracketID are required to join a pool.' });
    }
    try {
        // Optionally, check if the user has already joined this pool with this bracket
        const existingParticipant = await runQuery(
            'SELECT * FROM PoolParticipants WHERE PoolID = ? AND UserID = ? AND BracketID = ?',
            [poolId, userId, bracketId]
        );
        if (existingParticipant.length > 0) {
            return res.status(409).json({ error: 'User has already joined this pool with this bracket.' });
        }

        await runExec(
            'INSERT INTO PoolParticipants (PoolID, UserID, BracketID) VALUES (?, ?, ?)',
            [poolId, userId, bracketId]
        );
        res.status(201).json({ message: 'Joined pool successfully' });
    } catch (err) {
        console.error('Join pool error:', err);
        if (err.message && err.message.includes('SQLITE_CONSTRAINT')) {
             return res.status(409).json({ error: 'Failed to join pool due to a constraint. Perhaps already joined or invalid ID.' });
        }
        res.status(500).json({ error: 'Failed to join pool' });
    }
});

app.get('/api/pools/:poolId', async (req, res) => {
    const { poolId } = req.params;
    try {
        // 1. Fetch the pool details
        const poolDetailsArray = await runQuery(
            'SELECT PoolID, AdminID, TournamentID, Name, Description, Privacy, EntryFee FROM Pools WHERE PoolID = ?',
            [poolId]
        );

        if (poolDetailsArray.length === 0) {
            return res.status(404).json({ error: 'Pool not found' });
        }
        const poolDetails = poolDetailsArray[0];

        // 2. Fetch the participants for that pool
        // We want User's Username and their Bracket's Name
        const participants = await runQuery(
            `SELECT
                pp.ParticipantID,
                pp.UserID,
                u.Username,
                pp.BracketID,
                b.Name AS BracketName,
                b.Score AS BracketScore  -- It might be useful to display bracket scores
             FROM PoolParticipants pp
             JOIN Users u ON pp.UserID = u.UserID
             JOIN Brackets b ON pp.BracketID = b.BracketID
             WHERE pp.PoolID = ?`,
            [poolId]
        );

        // 3. Combine pool details with participants
        const responseData = {
            ...poolDetails,
            participants: participants
        };

        res.json(responseData);

    } catch (err) {
        console.error(`Workspace details for PoolID ${poolId} error:`, err);
        res.status(500).json({ error: 'Failed to fetch pool details' });
    }
});


// --- NEW ROUTES FOR USER PROFILE ---

// Get a user's brackets
app.get('/api/user-brackets/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const brackets = await runQuery(
            `SELECT b.BracketID, b.Name, b.Score, t.Name as TournamentName
             FROM Brackets b
             JOIN Tournaments t ON b.TournamentID = t.TournamentID
             WHERE b.UserID = ?`,
            [userId]
        );
        res.json(brackets);
    } catch (err) {
        console.error(`Workspace user brackets for UserID ${userId} error:`, err);
        res.status(500).json({ error: 'Failed to fetch user brackets' });
    }
});

// Get pools a user has joined
app.get('/api/user-pools/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const pools = await runQuery(
            `SELECT p.PoolID, p.Name, p.Description, t.Name as TournamentName
             FROM Pools p
             JOIN PoolParticipants pp ON p.PoolID = pp.PoolID
             JOIN Tournaments t ON p.TournamentID = t.TournamentID
             WHERE pp.UserID = ?`,
            [userId]
        );
        res.json(pools);
    } catch (err) {
        console.error(`Workspace user pools for UserID ${userId} error:`, err);
        res.status(500).json({ error: 'Failed to fetch user pools' });
    }
});

// --- END OF NEW ROUTES ---


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));