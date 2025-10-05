export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface SignupRequest {
    username: string;
    password: string;
    confirmPassword: string;
}

export interface User {
    id: number;
    username: string;
    globalRole: 'COMMON' | 'ADMIN';
}

export interface AuthState {
    username: string | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}