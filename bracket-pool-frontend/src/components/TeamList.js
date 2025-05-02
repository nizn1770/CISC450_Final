import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

function TeamList({ teams }) {
    const regions = ['South', 'West', 'East', 'Midwest'];

    return (
        <div>
            {regions.map(region => {
                const regionTeams = teams.filter(team => team.Region === region);
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
        </div>
    );
}

export default TeamList;