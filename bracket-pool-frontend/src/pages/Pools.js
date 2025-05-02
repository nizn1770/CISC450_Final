import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

function Pools() {
    const [pools, setPools] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/pools')
            .then(response => setPools(response.data))
            .catch(error => console.error('Error fetching pools:', error));
    }, []);

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>All Pools</Typography>
            <List>
                {pools.map(pool => (
                    <ListItem
                        key={pool.PoolID}
                        component={Link}
                        to={`/pools/${pool.PoolID}`}
                    >
                        <ListItemText primary={pool.Name} secondary={pool.Description} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

export default Pools;