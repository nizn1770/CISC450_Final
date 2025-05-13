import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, Button, TextField, Box, Typography } from '@mui/material';

function PoolList({ user, tournamentId, userBracketId }) {
    const [pools, setPools] = useState([]);
    const [newPoolName, setNewPoolName] = useState('');
    const [newPoolDescription, setNewPoolDescription] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/pools')
            .then(response => setPools(response.data.filter(pool => pool.TournamentID === tournamentId)))
            .catch(error => console.error('Error fetching pools:', error));
    }, [tournamentId]);

    // PoolList.js
    const createPool = () => {
        if (!user) {
            alert('Please log in to create a pool.');
            return;
        }

        if (!newPoolName.trim()) { // Check if pool name is empty or just whitespace
            alert('Pool name cannot be empty.');
            return;
        }

        if (!tournamentId && tournamentId !== 0) { // Check if tournamentId is valid
            alert('Tournament ID is missing. Cannot create pool.');
            console.error('Missing tournamentId prop in PoolList');
            return;
        }

        const payload = {
            adminId: user.userId,
            tournamentId,
            name: newPoolName.trim(), // Send trimmed name
            description: newPoolDescription,
            privacy: false,
            entryFee: 0.00
        };
        console.log("Creating pool with payload:", payload); // For debugging

        axios.post('http://localhost:5000/api/pools', payload)
            .then((response) => { // Expecting the new pool object from the server
                setNewPoolName('');
                setNewPoolDescription('');
                // Add the new pool to the list or re-fetch
                // If server returns the new pool object:
                setPools(prevPools => [...prevPools, response.data]);
                // If you still prefer to re-fetch (less optimal):
                // axios.get('http://localhost:5000/api/pools')
                //     .then(response => setPools(response.data.filter(pool => pool.TournamentID === tournamentId)));
            })
            .catch(error => {
                console.error('Error creating pool:', error.response ? error.response.data : error.message);
                alert(`Error creating pool: ${error.response ? error.response.data.error : error.message}`);
            });
    };

    const joinPool = (poolId) => {
        if (!user) {
            alert('Please log in to join a pool.');
            return;
        }

        if (!userBracketId) {
            alert('Please submit a bracket before joining a pool.');
            return;
        }

        axios.post('http://localhost:5000/api/pool-participants', {
            poolId,
            userId: user.userId,
            bracketId: userBracketId
        })
            .then(() => alert('Joined pool successfully!'))
            .catch(error => console.error('Error joining pool:', error));
    };

    return (
        <Box>
            <Typography variant="h6">Pools</Typography>
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Create a New Pool</Typography>
                <TextField
                    label="Pool Name"
                    value={newPoolName}
                    onChange={(e) => setNewPoolName(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Description"
                    value={newPoolDescription}
                    onChange={(e) => setNewPoolDescription(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" onClick={createPool}>Create Pool</Button>
            </Box>
            <List>
                {pools.map(pool => (
                    <ListItem
                        key={pool.PoolID}
                        component={Link}
                        to={`/pools/${pool.PoolID}`}
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <ListItemText primary={pool.Name} secondary={pool.Description} />
                        <Button variant="outlined" onClick={(e) => {
                            e.preventDefault(); // Prevent Link navigation
                            joinPool(pool.PoolID);
                        }}>
                            Join
                        </Button>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default PoolList;