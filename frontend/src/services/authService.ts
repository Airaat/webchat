import type {LoginRequest, LoginResponse} from "../types/auth.ts";
import {API_BASE_URL} from "../const.ts";

class AuthService {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({message: 'Login failed'}));
            throw new Error(errorData.message || 'Login failed');
        }

        return response.json();
    }

    setToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    removeToken(): void {
        localStorage.removeItem('authToken');
    }
}

export const authService = new AuthService();