import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box } from '@mui/material';
import TournamentList from '../components/TournamentList';

function Home() {
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/tournaments')
            .then(response => setTournaments(response.data))
            .catch(error => console.error('Error fetching tournaments:', error));
    }, []);

    return (
        <Container sx={{ mt: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>Welcome to Bracket Pool</Typography>
                <Typography variant="body1">
                    Create and join pools for your favorite tournaments! Pick your bracket, compete with friends,
                    and see who can predict the most games correctly.
                </Typography>
            </Box>
            <Typography variant="h5" gutterBottom>Tournaments</Typography>
            <TournamentList tournaments={tournaments} />
        </Container>
    );
}

export default Home;