import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

function TeamList({ teams, searchTerm = '' }) {
    const regions = ['South', 'West', 'East', 'Midwest'];
    const q = searchTerm.toLowerCase();

    const nameMatches = (team) =>
        !q ||
        team.Name.toLowerCase().includes(q) ||
        String(team.Seed).includes(q);

    return (
        <>
            {regions.map(region => {
                const regionTeams = teams
                    .filter(team => team.Region === region)
                    .filter(nameMatches);

                if (regionTeams.length === 0) return null;

                return (
                    <div key={region}>
                        <Typography variant="h6">{region} Region</Typography>
                        <List>
                            {regionTeams.map(team => (
                                <ListItem key={team.TeamID}>
                                    <ListItemText primary={`${team.Seed}. ${team.Name}`} />
                                </ListItem>
                            ))}
                        </List>
                    </div>
                );
            })}
        </>
    );
}

export default TeamList;
