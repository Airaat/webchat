import React from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContainer} from '../../components/auth/AuthContainer';
import {SignUpForm} from '../../components/auth/SignUpForm';
import {CssBaseline} from '@mui/material';

export const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const handleSignUpSuccess = () => {
        navigate('/chat');
    }

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <>
            <CssBaseline enableColorScheme/>
            <AuthContainer>
                <SignUpForm
                    onSuccess={handleSignUpSuccess}
                    onLoginClick={handleLoginClick}
                />
            </AuthContainer>
        </>
    );
};