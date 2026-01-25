import {API_BASE_URL} from "../const";
import {authService} from "../services/authService";

class ApiClient {
    async request<T>(endpoint: string, fetchConfig: RequestInit = {}): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...fetchConfig.headers,
        } as Record<string, string>;

        const token = authService.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        let response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...fetchConfig,
            headers,
            credentials: 'include',
        });

        if (response.status === 403 || response.status === 401) {
            try {
                const newToken = await authService.refresh();
                headers['Authorization'] = `Bearer ${newToken}`;

                response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...fetchConfig,
                    headers,
                    credentials: 'include',
                });
            } catch (error) {
                await authService.logout();
                window.location.href = '/login';
                alert('Session expired. Please login again.');
                throw error;
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `Request failed with status ${response.status}`
            }));
            throw new Error(errorData.message || 'Request failed');
        }

        return response.json();
    }

    get<T>(endpoint: string, fetchConfig?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {...fetchConfig, method: 'GET'});
    }

    post<T>(endpoint: string, data?: unknown, fetchConfig?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...fetchConfig,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    put<T>(endpoint: string, data?: unknown, fetchConfig?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...fetchConfig,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    delete<T>(endpoint: string, fetchConfig?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {...fetchConfig, method: 'DELETE'});
    }
}

export const apiClient = new ApiClient();