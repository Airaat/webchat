import {Client, type IMessage} from '@stomp/stompjs';
import {authService} from './authService';
import {WS_BASE_URL} from "../const.ts";

interface WebSocketConfig {
    brokerURL?: string;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
}

class WebSocketService {
    private client: Client | null = null;
    private isConnected = false;
    private subscriptions: Map<string, any> = new Map();
    private connectionCallbacks: Array<(connected: boolean) => void> = [];

    private config: WebSocketConfig = {};

    constructor(config: WebSocketConfig = {}) {
        this.config = config;
        this.config = {
            brokerURL: WS_BASE_URL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            ...config
        };
    }

    connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve(true);
                return;
            }

            const token = authService.getToken();
            if (!token) {
                reject(new Error('No authentication token available'));
                return;
            }

            this.client = new Client({
                brokerURL: this.config.brokerURL,
                reconnectDelay: this.config.reconnectDelay,
                heartbeatIncoming: this.config.heartbeatIncoming,
                heartbeatOutgoing: this.config.heartbeatOutgoing,
                connectHeaders: {
                    Authorization: `Bearer ${token}`
                },
                // Remove debug logs in production
                debug: (str) => {
                    console.log('STOMP:', str);
                },
                onConnect: () => {
                    this.isConnected = true;
                    console.log('WebSocket connected');
                    this.connectionCallbacks.forEach(callback => callback(true));
                    resolve(true);
                },
                onStompError: (frame) => {
                    console.error('WebSocket STOMP error:', frame);
                    this.isConnected = false;
                    reject(new Error(frame.headers?.message || 'WebSocket connection failed'));
                },
                onWebSocketError: (event) => {
                    console.error('WebSocket error:', event);
                    this.isConnected = false;
                    reject(new Error('WebSocket connection error'));
                },
                onDisconnect: () => {
                    this.isConnected = false;
                    console.log('WebSocket disconnected');
                    this.connectionCallbacks.forEach(callback => callback(false));
                },
            });

            this.client.activate();
        });
    }

    disconnect() {
        if (this.client) {
            this.subscriptions.forEach((subscription, topic) => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();
            this.client.deactivate();
            this.client = null;
            this.isConnected = false;
        }
    }

    subscribe<T>(topic: string, callback: (message: T) => void): string {
        if (!this.client || !this.isConnected) {
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

        const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

    send(destination: string, body: any) {
        if (!this.client || !this.isConnected) {
            throw new Error('WebSocket not connected');
        }

        this.client.publish({
            destination,
            body: JSON.stringify(body)
        });
    }

    onConnectionChange(callback: (connected: boolean) => void) {
        this.connectionCallbacks.push(callback);
    }

    getIsConnected(): boolean {
        return this.isConnected;
    }
}

export const webSocketService = new WebSocketService();