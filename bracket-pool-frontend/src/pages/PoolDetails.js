// src/pages/PoolDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress, Paper, Divider, Box } from '@mui/material'; // Added CircularProgress, Paper, Divider

function PoolDetails() {
    const { id: poolId } = useParams(); // Get poolId from URL parameters
    const [poolData, setPoolData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (poolId) {
            setLoading(true);
            setError(''); // Clear previous errors
            axios.get(`http://localhost:5000/api/pools/${poolId}`) // Use the correct endpoint
                .then(response => {
                    console.log("Fetched Pool Data:", response.data); // Log to see the structure
                    setPoolData(response.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching pool details:', err);
                    setError('Failed to fetch pool details. ' + (err.response?.data?.error || err.message));
                    setLoading(false);
                });
        }
    }, [poolId]);

    if (loading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography color="error" gutterBottom>{error}</Typography>
                <Typography variant="body2">Please ensure the server is running and the Pool ID is correct.</Typography>
            </Container>
        );
    }

    if (!poolData) {
        // This case should ideally be covered by loading or error states.
        // If you reach here after loading and no error, it means API returned empty success (unlikely for this endpoint)
        return (
            <Container sx={{ mt: 4 }}>
                <Typography>No pool data found or pool does not exist.</Typography>
            </Container>
        );
    }

    // Now, poolData contains all info: poolData.Name, poolData.Description, poolData.participants array
    // Each item in poolData.participants should have Username, BracketName, BracketScore

    return (
        <Container sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {poolData.Name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    {poolData.Description || "No description provided."}
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                    Privacy: {poolData.Privacy} | Entry Fee: ${poolData.EntryFee != null ? poolData.EntryFee.toFixed(2) : 'N/A'}
                </Typography>
                {/* You could add more pool details here, e.g., Tournament Name if you join and fetch it in the API */}
            </Paper>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Participants ({poolData.participants ? poolData.participants.length : 0})
            </Typography>
            {poolData.participants && Array.isArray(poolData.participants) && poolData.participants.length > 0 ? (
                <List>
                    {poolData.participants.map(participant => (
                        <React.Fragment key={participant.ParticipantID}> {/* Assuming ParticipantID is unique here */}
                            <ListItem alignItems="flex-start">
                                <ListItemText
                                    primary={participant.Username}
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.primary">
                                                Bracket: {participant.BracketName || "N/A"}
                                            </Typography>
                                            <br />
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                Score: {participant.BracketScore !== undefined ? participant.BracketScore : 'N/A'}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>
            ) : (
                <Typography>
                    {poolData.participants && !Array.isArray(poolData.participants)
                        ? "Error: Participant data is in an unexpected format."
                        : "No participants have joined this pool yet."}
                </Typography>
            )}
        </Container>
    );
}

export default PoolDetails;