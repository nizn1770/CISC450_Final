import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Tabs, Tab, Box, TextField, Button } from '@mui/material';
import TeamList from '../components/TeamList';
import Bracket from '../components/Bracket';
import PoolList from '../components/PoolList';

function TournamentDetails({ user }) {
    const { id } = useParams();
    const [teams, setTeams] = useState([]);
    const [games, setGames] = useState([]);
    const [tab, setTab] = useState(0);
    const [userBracketId, setUserBracketId] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm]   = useState('');

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

    const doSearch   = () => setSearchTerm(searchInput.trim());
    const clearSearch = () => { setSearchInput(''); setSearchTerm(''); };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Tournament Details</Typography>

            {/* tabs unchanged */}
            <Tabs value={tab} onChange={handleTabChange}>
                <Tab label="Teams" />
                <Tab label="Bracket" />
                <Tab label="Pools" />
            </Tabs>

            {/* search bar appears only for Teams or Bracket views */}
            {(tab === 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TextField
                        size="small"
                        label="Search team"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        sx={{ mr: 1, flexGrow: 1 }}
                    />
                    <Button variant="outlined" onClick={doSearch}>Search</Button>
                    {searchTerm && (
                        <Button sx={{ ml: 1 }} onClick={clearSearch}>
                            Clear
                        </Button>
                    )}
                </Box>
            )}

            {tab === 0 && <TeamList teams={teams} searchTerm={searchTerm} />}
            {tab === 1 && (
                <Bracket
                    games={games}
                    user={user}
                    tournamentId={parseInt(id)}
                    onBracketSubmit={handleBracketSubmit}
                    searchTerm={searchTerm}
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