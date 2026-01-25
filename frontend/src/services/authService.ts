import type {LoginRequest, LoginResponse, SignupRequest, User} from "../types/auth.ts";
import {jwtService} from "./jwtService.ts";
import {API_BASE_URL} from "../const.ts";

class AuthService {
    private isRefreshing: boolean = false;
    private refreshPromise: Promise<string> | null = null;

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials),
            credentials: 'include',
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
            body: JSON.stringify(credentials),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({message: 'Sign up failed'}));
            throw new Error(errorData.message || 'Sign up failed');
        }

        const responseData: LoginResponse = await response.json();
        this.setToken(responseData.token)
        return responseData;
    }

    async logout(): Promise<void> {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            this.removeToken();
        }
    }

    async refresh(): Promise<string> {
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;

        this.refreshPromise = this.performRefresh()
            .finally(() => {
                this.isRefreshing = false;
                this.refreshPromise = null;
            });

        return this.refreshPromise;
    }

    private async performRefresh(): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            this.removeToken();
            throw new Error('Session expired. Please login again.');
        }

        const responseData: LoginResponse = await response.json();
        this.setToken(responseData.token);
        return responseData.token;
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

    private removeToken(): void {
        localStorage.removeItem('authToken');
    }
}

export const authService = new AuthService();