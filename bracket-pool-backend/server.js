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

// Helper function to run queries (since sqlite3 uses callbacks, we'll wrap it in a Promise for consistency)
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Helper function for INSERT/UPDATE/DELETE queries (returns the last inserted ID if applicable)
const runExec = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ insertId: this.lastID });
            }
        });
    });
};

// User Registration (Plain Text Password)
app.post('/api/register', async (req, res) => {
    const { username, email, password, name } = req.body;
    try {
        const result = await runExec(
            'INSERT INTO Users (Username, Email, Password, Name) VALUES (?, ?, ?, ?)',
            [username, email, password, name]
        );
        res.status(201).json({ userId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User Login (Plain Text Password)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await runQuery('SELECT * FROM Users WHERE Email = ?', [email]);
        const user = users[0];
        if (user && user.Password === password) {
            res.json({ userId: user.UserID, username: user.Username });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get Tournaments
app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await runQuery('SELECT * FROM Tournaments');
        res.json(tournaments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});

// Get Teams for a Tournament
app.get('/api/tournaments/:id/teams', async (req, res) => {
    const { id } = req.params;
    try {
        const teams = await runQuery(
            'SELECT * FROM Teams WHERE TournamentID = ? ORDER BY Seed, Region',
            [id]
        );
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Get Games for a Tournament
app.get('/api/tournaments/:id/games', async (req, res) => {
    const { id } = req.params;
    try {
        const games = await runQuery(
            'SELECT * FROM Games WHERE TournamentID = ? ORDER BY GameNumber',
            [id]
        );
        res.json(games);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

// Submit a Bracket
app.post('/api/brackets', async (req, res) => {
    const { userId, tournamentId, name, picks } = req.body;
    try {
        const bracketResult = await runExec(
            'INSERT INTO Brackets (UserID, TournamentID, Name, Score, PossiblePoints) VALUES (?, ?, ?, 0, 0)',
            [userId, tournamentId, name]
        );
        const bracketId = bracketResult.insertId;

        const pickValues = picks.map(pick => [bracketId, pick.gameId, pick.predictedWinnerId, 0]);
        for (const pick of pickValues) {
            await runExec(
                'INSERT INTO BracketPicks (BracketID, GameID, PredictedWinnerID, IsCorrect) VALUES (?, ?, ?, ?)',
                pick
            );
        }
        res.status(201).json({ bracketId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create bracket' });
    }
});

// Get Pools
app.get('/api/pools', async (req, res) => {
    try {
        const pools = await runQuery('SELECT * FROM Pools');
        res.json(pools);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pools' });
    }
});

// Create a Pool
app.post('/api/pools', async (req, res) => {
    const { adminId, tournamentId, name, description, privacy, entryFee } = req.body;
    try {
        const result = await runExec(
            'INSERT INTO Pools (AdminID, TournamentID, Name, Description, Privacy, EntryFee) VALUES (?, ?, ?, ?, ?, ?)',
            [adminId, tournamentId, name, description, privacy, entryFee]
        );
        res.status(201).json({ poolId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create pool' });
    }
});

// Join a Pool
app.post('/api/pool-participants', async (req, res) => {
    const { poolId, userId, bracketId } = req.body;
    try {
        await runExec(
            'INSERT INTO PoolParticipants (PoolID, UserID, BracketID) VALUES (?, ?, ?)',
            [poolId, userId, bracketId]
        );
        res.status(201).json({ message: 'Joined pool successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to join pool' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));