import {useContext, useState} from 'react';
import {AuthContext} from '../contexts/AuthContext';
import {authService} from "../services/authService.ts";
import type {LoginRequest} from '../types/auth';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials: LoginRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            return await authService.login(credentials);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {login, isLoading, error};
};