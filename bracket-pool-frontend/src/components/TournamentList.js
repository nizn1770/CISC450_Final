import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText } from '@mui/material';

function TournamentList({ tournaments }) {
    return (
        <List>
            {tournaments.map(tournament => (
                <ListItem
                    key={tournament.TournamentID}
                    component={Link}
                    to={`/tournaments/${tournament.TournamentID}`}
                >
                    <ListItemText
                        primary={tournament.Name}
                        secondary={`Year: ${tournament.Year} | Dates: ${tournament.StartDate} to ${tournament.EndDate}`}
                    />
                </ListItem>
            ))}
        </List>
    );
}

export default TournamentList;