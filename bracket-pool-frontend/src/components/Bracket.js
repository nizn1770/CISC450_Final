import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Button, Typography, Box } from '@mui/material';

function Bracket({ games, user, tournamentId, onBracketSubmit }) {
    const [teams, setTeams] = useState([]);
    const [picks, setPicks] = useState({});

    useEffect(() => {
        axios.get(`http://localhost:5000/api/tournaments/${tournamentId}/teams`)
            .then(response => setTeams(response.data))
            .catch(error => console.error('Error fetching teams:', error));
    }, [tournamentId]);

    const handlePick = (gameId, teamId) => {
        setPicks(prev => ({ ...prev, [gameId]: teamId }));
    };

    const submitBracket = () => {
        if (!user) {
            alert('Please log in to submit a bracket.');
            return;
        }

        const bracketPicks = Object.entries(picks).map(([gameId, predictedWinnerId]) => ({
            gameId: parseInt(gameId),
            predictedWinnerId: parseInt(predictedWinnerId)
        }));

        if (bracketPicks.length === 0) {
            alert('Please make at least one pick before submitting.');
            return;
        }

        axios.post('http://localhost:5000/api/brackets', {
            userId: user.userId,
            tournamentId,
            name: `${user.username}'s Bracket`,
            picks: bracketPicks
        })
            .then(response => {
                alert('Bracket submitted successfully!');
                onBracketSubmit(response.data.bracketId);
            })
            .catch(error => {
                console.error('Error submitting bracket:', error);
                alert('Failed to submit bracket.');
            });
    };

    // Define game dependencies
    const getGameDependencies = (gameNumber) => {
        if (gameNumber >= 1 && gameNumber <= 32) return []; // Round 1 games have no dependencies
        if (gameNumber === 33) return [1, 8];
        if (gameNumber === 34) return [2, 7];
        if (gameNumber === 35) return [3, 6];
        if (gameNumber === 36) return [4, 5];
        if (gameNumber === 37) return [9, 16];
        if (gameNumber === 38) return [10, 15];
        if (gameNumber === 39) return [11, 14];
        if (gameNumber === 40) return [12, 13];
        if (gameNumber === 41) return [17, 24];
        if (gameNumber === 42) return [18, 23];
        if (gameNumber === 43) return [19, 22];
        if (gameNumber === 44) return [20, 21];
        if (gameNumber === 45) return [25, 32];
        if (gameNumber === 46) return [26, 31];
        if (gameNumber === 47) return [27, 30];
        if (gameNumber === 48) return [28, 29];
        if (gameNumber === 49) return [33, 36];
        if (gameNumber === 50) return [34, 35];
        if (gameNumber === 51) return [37, 40];
        if (gameNumber === 52) return [38, 39];
        if (gameNumber === 53) return [41, 44];
        if (gameNumber === 54) return [42, 43];
        if (gameNumber === 55) return [45, 48];
        if (gameNumber === 56) return [46, 47];
        if (gameNumber === 57) return [49, 50];
        if (gameNumber === 58) return [51, 52];
        if (gameNumber === 59) return [53, 54];
        if (gameNumber === 60) return [55, 56];
        if (gameNumber === 61) return [57, 58];
        if (gameNumber === 62) return [59, 60];
        if (gameNumber === 63) return [61, 62];
        return [];
    };

    // Determine the teams for a game based on picks
    const getTeamsForGame = (game) => {
        const { GameNumber, Team1ID, Team2ID } = game;
        
        // Round 1 games have predefined teams
        if (GameNumber >= 1 && GameNumber <= 32) {
            return { team1: teams.find(t => t.TeamID === Team1ID), team2: teams.find(t => t.TeamID === Team2ID) };
        }

        // For later rounds, determine teams based on picks from previous games
        const [depGame1, depGame2] = getGameDependencies(GameNumber);
        let team1 = null, team2 = null;

        if (depGame1 && picks[depGame1]) {
            team1 = teams.find(t => t.TeamID === picks[depGame1]);
        }
        if (depGame2 && picks[depGame2]) {
            team2 = teams.find(t => t.TeamID === picks[depGame2]);
        }

        return { team1, team2 };
    };

    return (
        <Box>
            <Typography variant="h6">Make Your Picks</Typography>
            <List>
                {games.map(game => {
                    const { team1, team2 } = getTeamsForGame(game);
                    return (
                        <ListItem key={game.GameID}>
                            <ListItemText
                                primary={`Game ${game.GameNumber}: ${
                                    team1 && team2
                                        ? `${team1.Seed}. ${team1.Name} vs. ${team2.Seed}. ${team2.Name}`
                                        : team1
                                        ? `${team1.Seed}. ${team1.Name} vs. TBD`
                                        : team2
                                        ? `TBD vs. ${team2.Seed}. ${team2.Name}`
                                        : 'TBD vs. TBD'
                                }`}
                            />
                            {team1 && team2 && (
                                <Box>
                                    <Button
                                        variant={picks[game.GameID] === team1.TeamID ? 'contained' : 'outlined'}
                                        onClick={() => handlePick(game.GameID, team1.TeamID)}
                                        sx={{ mr: 1 }}
                                    >
                                        {team1.Name}
                                    </Button>
                                    <Button
                                        variant={picks[game.GameID] === team2.TeamID ? 'contained' : 'outlined'}
                                        onClick={() => handlePick(game.GameID, team2.TeamID)}
                                    >
                                        {team2.Name}
                                    </Button>
                                </Box>
                            )}
                        </ListItem>
                    );
                })}
            </List>
            <Button variant="contained" onClick={submitBracket} sx={{ mt: 2 }}>
                Submit Bracket
            </Button>
        </Box>
    );
}

export default Bracket;