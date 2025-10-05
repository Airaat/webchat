import React, {useState} from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Typography,
    Link,
    Alert,
} from '@mui/material';
import {Card} from '../ui/Layout/Card';
import {TextField} from '../ui/Form/TextField';
import {useLogin} from '../../hooks/useAuth';
import type {LoginRequest} from '../../types/auth';

interface LoginFormProps {
    onSuccess?: () => void;
    onSignUpClick?: () => void;
}

interface FormErrors {
    username?: string;
    password?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({onSuccess, onSignUpClick}) => {
    const {login, isLoading, error: networkError} = useLogin();
    const [formData, setFormData] = useState<LoginRequest>({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Please enter a username';
        }

        if (!/\S+/.test(formData.username)) {
            newErrors.username = 'Invalid username: remove spaces';
        }

        if (!formData.password) {
            newErrors.password = 'Please enter a password';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await login(formData);
            onSuccess?.();
        } catch (err) {
            // Error is handled by the hook
            console.error('Login error:', err);
        }
    };

    return (
        <Card>
            <Typography
                component="h1"
                variant="h4"
                sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', textAlign: 'center'}}
            >
                Sign in
            </Typography>

            {networkError && (
                <Alert severity="error" sx={{width: '100%'}}>
                    {networkError}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <TextField
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    required
                    error={!!errors.username}
                    helperText={errors.username}
                    value={formData.username}
                    onChange={handleInputChange}
                />

                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    error={!!errors.password}
                    helperText={errors.password}
                    value={formData.password}
                    onChange={handleInputChange}
                />

                <FormControlLabel
                    control={<Checkbox value="remember" color="primary"/>}
                    label="Remember me"
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{mt: 2}}
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
            </Box>

            <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                <Typography>
                    Don't have an account?{' '}
                    <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={onSignUpClick}
                        sx={{border: 'none', background: 'none', cursor: 'pointer'}}
                    >
                        Sign up
                    </Link>
                </Typography>
            </Box>
        </Card>
    );
};