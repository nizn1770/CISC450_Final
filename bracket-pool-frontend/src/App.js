import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Home from './pages/Home';
// Assuming you might have a page to list all tournaments:
// import TournamentList from './pages/TournamentList'; // You'd create this component
import TournamentDetails from './pages/TournamentDetails';
import PoolDetails from './pages/PoolDetails';
import UserProfile from './pages/UserProfile';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Tournaments from './pages/Tournaments';
import Pools from './pages/Pools';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

const LOCAL_STORAGE_USER_KEY = 'bracketPoolUser';

function App() {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            return null;
        }
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
    }, [user]);

    const handleLogin = (userData) => {
        if (userData && userData.userId) {
            setUser(userData);
        } else {
            console.error("Login attempt provided invalid user data:", userData);
        }
    };

    const handleRegister = (userData) => {
         if (userData && userData.userId) {
            setUser(userData);
        } else {
            console.error("Register attempt provided invalid user data:", userData);
        }
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
                        {/* --- RESTORED TOURNAMENTS BUTTON --- */}
                        <Button color="inherit" component={Link} to="/tournaments">Tournaments</Button>
                        <Button color="inherit" component={Link} to="/pools">Pools</Button>
                        {user ? (
                            <>
                                <Button color="inherit" component={Link} to="/profile">Profile ({user.username})</Button>
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
                    {/* You would need a component for the /tournaments path if it's a list page */}
                    {/* For example: <Route path="/tournaments" element={<TournamentList user={user} />} /> */}
                    {/* If /tournaments is not a page itself, and you only have /tournaments/:id, */}
                    {/* then the button might need to link differently or this route isn't needed. */}
                    {/* For now, the button links to /tournaments, implying a list page might exist or be planned. */}
                    <Route path="/tournaments/:id" element={<TournamentDetails user={user} />} />
                    <Route path="/tournaments" element={<Tournaments />} />
                    <Route path="/pools" element={<Pools user={user}/>} />
                    <Route path="/pools/:id" element={<PoolDetails user={user}/>} />
                    <Route path="/profile" element={<UserProfile user={user} />} />
                    <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
                    <Route path="/register" element={<RegisterForm onRegister={handleRegister} />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;