import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Tabs, Tab } from '@mui/material';
import TeamList from '../components/TeamList';
import Bracket from '../components/Bracket';
import PoolList from '../components/PoolList';

function TournamentDetails({ user }) {
    const { id } = useParams();
    const [teams, setTeams] = useState([]);
    const [games, setGames] = useState([]);
    const [tab, setTab] = useState(0);
    const [userBracketId, setUserBracketId] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/tournaments/${id}/teams`)
            .then(response => setTeams(response.data))
            .catch(error => console.error('Error fetching teams:', error));

        axios.get(`http://localhost:5000/api/tournaments/${id}/games`)
            .then(response => setGames(response.data))
            .catch(error => console.error('Error fetching games:', error));
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const handleBracketSubmit = (bracketId) => {
        setUserBracketId(bracketId);
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Tournament Details</Typography>
            <Tabs value={tab} onChange={handleTabChange}>
                <Tab label="Teams" />
                <Tab label="Bracket" />
                <Tab label="Pools" />
            </Tabs>
            {tab === 0 && <TeamList teams={teams} />}
            {tab === 1 && (
                <Bracket
                    games={games}
                    user={user}
                    tournamentId={parseInt(id)}
                    onBracketSubmit={handleBracketSubmit}
                />
            )}
            {tab === 2 && (
                <PoolList
                    user={user}
                    tournamentId={parseInt(id)}
                    userBracketId={userBracketId}
                />
            )}
        </Container>
    );
}

export default TournamentDetails;