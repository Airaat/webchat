import {useContext, useEffect} from 'react';
import {AuthContext} from '../contexts/AuthContext';
import {useNavigate} from "react-router-dom";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    const navigate = useNavigate();

    useEffect(() => {
        if (context.isLoading) return;

        if (context.user === null) {
            navigate('/login');
            return;
        }

    }, [context.isLoading, context.user, navigate]);

    return context;
};