import React from 'react';
import {CssBaseline} from '@mui/material';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {LoginForm} from '../../components/auth/LoginForm';
import {useAuth} from '../../hooks/useAuth';
import {useNavigate} from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const {username} = useAuth();
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
        navigate('/signup');
    };

    return (
        <>
            <CssBaseline enableColorScheme/>
            <AuthContainer direction="column" justifyContent="center">
                <LoginForm onSuccess={handleLoginSuccess} onSignUpClick={handleSignUpClick}/>
            </AuthContainer>
        </>
    );
};