import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Home from './pages/Home';
import TournamentDetails from './pages/TournamentDetails';
import PoolDetails from './pages/PoolDetails';
import UserProfile from './pages/UserProfile';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Pools from './pages/Pools';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Blue color for AppBar and buttons
        },
        secondary: {
            main: '#dc004e', // Red color for secondary actions
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

function App() {
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleRegister = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Bracket Pool
                        </Typography>
                        <Button color="inherit" component={Link} to="/">Home</Button>
                        <Button color="inherit" component={Link} to="/tournaments">Tournament</Button>
                        <Button color="inherit" component={Link} to="/pools">Pools</Button>
                        {user ? (
                            <>
                                <Button color="inherit" component={Link} to="/profile">Profile</Button>
                                <Button color="inherit" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={Link} to="/login">Login</Button>
                                <Button color="inherit" component={Link} to="/register">Register</Button>
                            </>
                        )}
                    </Toolbar>
                </AppBar>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tournaments/:id" element={<TournamentDetails user={user} />} />
                    <Route path="/pools" element={<Pools />} />
                    <Route path="/pools/:id" element={<PoolDetails />} />
                    <Route path="/profile" element={<UserProfile user={user} />} />
                    <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
                    <Route path="/register" element={<RegisterForm onRegister={handleRegister} />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;