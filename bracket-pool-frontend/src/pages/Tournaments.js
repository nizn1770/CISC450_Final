import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import TournamentList from '../components/TournamentList';

function Tournaments() {
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/tournaments')
            .then(response => setTournaments(response.data))
            .catch(error => console.error('Error fetching tournaments:', error));
    }, []);

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>Tournaments</Typography>
            <TournamentList tournaments={tournaments} />
        </Container>
    );
}

export default Tournaments;