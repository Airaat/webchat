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

export interface AuthState {
    username: string | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

export type UserRole = 'COMMON' | 'ADMIN';

export interface User {
    id: number;
    username: string;
    globalRole: UserRole;
}

export const isUserRole = (role: string): role is UserRole => {
    return role === 'COMMON' || role === 'ADMIN';
};

export const toUserRole = (role: string): UserRole => {
    if (isUserRole(role)) {
        return role;
    }

    console.warn(`Invalid role received: ${role}, defaulting to COMMON`);
    return 'COMMON';
};