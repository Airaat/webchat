import {Client, type IMessage, type StompSubscription} from '@stomp/stompjs';
import {authService} from '../services/authService';
import {jwtService} from "../services/jwtService";
import {WS_BASE_URL} from "../const";

interface WebSocketConfig {
    brokerURL?: string;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
}

class WebSocketClient {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
    private config: WebSocketConfig = {};
    private tokenRefreshTimer: number | null = null;

    constructor(config: WebSocketConfig = {}) {
        this.config = {
            brokerURL: WS_BASE_URL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            ...config
        };
    }

    async connect(): Promise<void> {
        if (this.client?.connected) {
            return;
        }

        const token = authService.getToken();
        if (!token) {
            throw new Error('No authentication token available');
        }

        if (this.client) {
            await this.client.deactivate();
        }

        this.client = new Client({
            ...this.config,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            onConnect: () => {
                console.log('WebSocket connected');
                this.scheduleTokenRefresh();
                this.notifyConnectionChange(true);
            },
            onStompError: async (frame) => {
                console.error('WebSocket STOMP error:', frame);
                const errorMessage = frame.headers?.message || frame.body || '';
                const isAuthError =
                    errorMessage.includes('Unauthorized') ||
                    errorMessage.includes('Authentication') ||
                    errorMessage.includes('401') ||
                    errorMessage.includes('403');

                if (isAuthError) {
                    await this.handleTokenExpired();
                }
            },
            onWebSocketError: (event) => {
                console.error('WebSocket error:', event);
                this.notifyConnectionChange(false);
            },
            onDisconnect: () => {
                console.log('WebSocket disconnected');
                this.clearTokenRefreshTimer();
                this.notifyConnectionChange(false);
            },
        });

        this.client.activate();
    }

    private scheduleTokenRefresh() {
        this.clearTokenRefreshTimer();

        const token = authService.getToken();
        if (!token) return;

        const expirationDate = jwtService.getTokenExpiration(token);
        if (!expirationDate) return;

        const refreshTime = expirationDate.getTime() - Date.now() - (5 * 60 * 1000);
        if (refreshTime > 0) {
            this.tokenRefreshTimer = window.setTimeout(async () => {
                await this.handleTokenExpired();
            }, refreshTime);
        }
    }

    private async handleTokenExpired() {
        try {
            console.log('Refreshing WebSocket token...');
            await authService.refresh();
            await this.reconnect();
            console.log('WebSocket token refreshed successfully');
        } catch (err) {
            console.error('Failed to refresh token:', err);
            this.disconnect();
            await authService.logout();
            alert('Session expired. Please log in again.');
            window.location.href = '/login';
        }
    }

    private async reconnect() {
        if (this.client) {
            await this.client.deactivate();
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        await this.connect();
    }

    private clearTokenRefreshTimer() {
        if (this.tokenRefreshTimer) {
            clearTimeout(this.tokenRefreshTimer);
            this.tokenRefreshTimer = null;
        }
    }

    private notifyConnectionChange(connected: boolean) {
        this.connectionCallbacks.forEach(callback => callback(connected));
    }

    disconnect() {
        this.clearTokenRefreshTimer();

        if (this.client) {
            this.subscriptions.forEach(sub => sub.unsubscribe());
            this.subscriptions.clear();
            this.client.deactivate();
            this.client = null;
        }
    }

    subscribe<T>(topic: string, callback: (message: T) => void): string {
        if (!this.client || !this.client.connected) {
            throw new Error('WebSocket not connected');
        }

        const subscription = this.client.subscribe(topic, (message: IMessage) => {
            try {
                const parsedMessage: T = JSON.parse(message.body);
                callback(parsedMessage);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        const subscriptionId = `${topic}-${Date.now()}`;
        this.subscriptions.set(subscriptionId, subscription);
        return subscriptionId;
    }

    unsubscribe(subscriptionId: string) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(subscriptionId);
        }
    }

    send<T>(destination: string, body?: T) {
        if (!this.client || !this.client.connected) {
            throw new Error('WebSocket not connected');
        }

        this.client.publish({
            destination,
            body: JSON.stringify(body)
        });
    }

    onConnectionChange(callback: (connected: boolean) => void) {
        this.connectionCallbacks.add(callback);
        return () => this.connectionCallbacks.delete(callback);
    }

    get isConnected(): boolean {
        return this.client?.connected || false;
    }
}

export const webSocketClient = new WebSocketClient();