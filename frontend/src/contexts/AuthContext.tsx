import React, {createContext, useState, useEffect, type ReactNode} from 'react';
import type {LoginRequest} from '../types/auth';
import {authService} from '../services/authService';

interface AuthContextType {
    username: string | null;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = authService.getToken();
        if (token) {
            // TODO: unpack jwt for get id, username, role, etc
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login(credentials);
            authService.setToken(response.token);
            setUsername(credentials.username);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.removeToken();
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{username, isLoading, login, logout, error}}>
            {children}
        </AuthContext.Provider>
    );
};