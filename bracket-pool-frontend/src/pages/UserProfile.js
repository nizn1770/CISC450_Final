import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function UserProfile({ user }) {
    const [brackets, setBrackets] = useState([]);
    const [pools, setPools] = useState([]);

    useEffect(() => {
        if (user) {
            // Fetch user's brackets
            axios.get(`http://localhost:5000/api/user-brackets/${user.userId}`)
                .then(response => setBrackets(response.data))
                .catch(error => console.error('Error fetching brackets:', error));

            // Fetch user's pools
            axios.get(`http://localhost:5000/api/user-pools/${user.userId}`)
                .then(response => setPools(response.data))
                .catch(error => console.error('Error fetching pools:', error));
        }
    }, [user]);

    if (!user) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>Please Log In</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>User Profile</Typography>
            <Typography variant="h6">Username: {user.username}</Typography>

            <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Your Brackets</Typography>
                <List>
                    {brackets.map(bracket => (
                        <ListItem key={bracket.BracketID}>
                            <ListItemText
                                primary={bracket.Name}
                                secondary={`Tournament: ${bracket.TournamentName}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Your Pools</Typography>
                <List>
                    {pools.map(pool => (
                        <ListItem
                            key={pool.PoolID}
                            component={Link}
                            to={`/pools/${pool.PoolID}`}
                        >
                            <ListItemText primary={pool.Name} secondary={pool.Description} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Container>
    );
}

export default UserProfile;