import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, List, ListItem, ListItemText, Box } from '@mui/material';

function PoolDetails() {
    const { id } = useParams();
    const [pool, setPool] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [brackets, setBrackets] = useState({});

    useEffect(() => {
        // Fetch pool details
        axios.get('http://localhost:5000/api/pools')
            .then(response => {
                const poolData = response.data.find(p => p.PoolID === parseInt(id));
                setPool(poolData);
            })
            .catch(error => console.error('Error fetching pool:', error));

        // Fetch participants
        axios.get(`http://localhost:5000/api/pool-participants/${id}`)
            .then(response => {
                setParticipants(response.data);
                // Fetch brackets for each participant
                response.data.forEach(participant => {
                    axios.get(`http://localhost:5000/api/brackets/${participant.BracketID}`)
                        .then(res => {
                            setBrackets(prev => ({
                                ...prev,
                                [participant.BracketID]: res.data
                            }));
                        })
                        .catch(err => console.error('Error fetching bracket:', err));
                });
            })
            .catch(error => console.error('Error fetching participants:', error));
    }, [id]);

    if (!pool) {
        return <Container sx={{ mt: 4 }}><Typography>Loading...</Typography></Container>;
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>{pool.Name}</Typography>
            <Typography variant="body1" gutterBottom>{pool.Description}</Typography>
            <Typography variant="h6">Participants</Typography>
            <List>
                {participants.map(participant => (
                    <ListItem key={participant.ParticipantID}>
                        <ListItemText
                            primary={participant.Username}
                            secondary={
                                brackets[participant.BracketID] ? (
                                    <Box>
                                        <Typography variant="body2">
                                            Bracket: {brackets[participant.BracketID].bracket.Name}
                                        </Typography>
                                        <Typography variant="body2">
                                            Picks: {brackets[participant.BracketID].picks.length} games picked
                                        </Typography>
                                    </Box>
                                ) : 'Loading bracket...'
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

export default PoolDetails;