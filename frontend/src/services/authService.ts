import type {LoginRequest, LoginResponse, SignupRequest, User} from "../types/auth.ts";
import {jwtService} from "./jwtService.ts";
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

        const responseData: LoginResponse = await response.json();
        this.setToken(responseData.token)
        return responseData;
    }

    async signup(credentials: SignupRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({message: 'Sign up failed'}));
            throw new Error(errorData.message || 'Sign up failed');
        }

        const responseData: LoginResponse = await response.json();
        this.setToken(responseData.token)
        return responseData;
    }

    logout(): void {
        localStorage.removeItem('authToken');
    }

    getCurrentUser(): User | null {
        const token = this.getToken();
        return token ? jwtService.getUserFromToken(token) : null;
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        return !!token && !jwtService.isTokenExpired(token);
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private setToken(token: string): void {
        localStorage.setItem('authToken', token);
    }
}

export const authService = new AuthService();