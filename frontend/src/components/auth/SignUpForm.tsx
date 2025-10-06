import React, {useState} from "react";
import {Card} from '../ui/Layout/Card';
import {TextField} from "../ui/Form/TextField.tsx";
import type {SignupRequest} from "../../types/auth.ts";
import {Alert, Box, Button, Link, Typography} from "@mui/material";
import {authService} from "../../services/authService.ts";

interface SignUpFormProps {
    onSuccess?: () => void;
    onLoginClick?: () => void;
}

interface FormErrors {
    username?: string;
    password?: string;
    confirmPassword?: string;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({onSuccess, onLoginClick}) => {
    const [formData, setFormData] = useState<SignupRequest>({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [networkError, setNetworkError] = useState<string | null>(null);
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

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please repeat a password';
        } else if (formData.confirmPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Password doesn't match";
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
            setIsLoading(true);
            const request: SignupRequest = {
                username: formData.username,
                password: formData.password,
                confirmPassword: formData.password
            };
            await authService.signup(request);
            onSuccess?.();
        } catch (e) {
            const message = 'Registration error:' + e;
            console.error(message);
            setNetworkError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <Typography
                component="h1"
                variant="h4"
                sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', textAlign: 'center'}}
            >
                Sign up
            </Typography>

            {networkError && (
                <Alert severity="error" sx={{width: '100%'}}>
                    {networkError}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{display: 'flex', flexDirection: 'column', gap: 2}}
            >
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

                <TextField
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{mt: 2}}
                >
                    {isLoading ? 'Signing up...' : 'Sign up'}
                </Button>
            </Box>

            <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                <Typography>
                    Already have an account?{' '}
                    <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={onLoginClick}
                        sx={{border: 'none', background: 'none', cursor: 'pointer'}}
                    >
                        Sign in
                    </Link>
                </Typography>
            </Box>
        </Card>
    );
};
