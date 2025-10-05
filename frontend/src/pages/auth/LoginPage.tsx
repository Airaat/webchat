import React from 'react';
import { CssBaseline, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const { username } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (username) {
            // TODO: implement in the future
            navigate('/chat');
        }
    }, [username, navigate]);

    const handleLoginSuccess = () => {
        navigate('/chat');
    };

    const handleSignUpClick = () => {
        // TODO: implement in the future
        navigate('/signup');
    };

    return (
        <>
            <CssBaseline enableColorScheme />
            <SignInContainer direction="column" justifyContent="center">
                <LoginForm onSuccess={handleLoginSuccess} onSignUpClick={handleSignUpClick} />
            </SignInContainer>
        </>
    );
};

const SignInContainer = styled(Stack)(({ theme }) => ({
    height: '100vh',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
    },
}));