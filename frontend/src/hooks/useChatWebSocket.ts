import {useEffect, useRef, useCallback} from 'react';
import {webSocketService} from '../services/websocketService';
import type {Message, MessageRequest, TypingNotification} from '../types/chat';

interface UseChatWebSocketProps {
    chatId?: string;
    onMessageReceived: (message: Message) => void;
    onTypingUpdate?: (username: string, isTyping: boolean) => void;
    onConnectionChange?: (connected: boolean) => void;
}

export const useChatWebSocket = ({
                                     chatId,
                                     onMessageReceived,
                                     onTypingUpdate,
                                     onConnectionChange
                                 }: UseChatWebSocketProps) => {
    const subscriptions = useRef<Map<string, string>>(new Map());

    const sendMessage = useCallback((message: MessageRequest) => {
        if (!chatId) {
            console.error('No chat selected');
            return;
        }

        webSocketService.send(`/app/chat/${chatId}/send`, message);
    }, [chatId]);

    const sendTyping = useCallback((isTyping: boolean) => {
        if (!chatId) return;

        webSocketService.send(`/app/chat/${chatId}/typing`, {isTyping});
    }, [chatId]);

    const subscribeToChat = useCallback(() => {
        if (!chatId) return;

        // Subscribe to new messages
        const messageSub = webSocketService.subscribe<Message>(
            `/topic/chat/${chatId}`,
            onMessageReceived
        );
        subscriptions.current.set(`messages-${chatId}`, messageSub);

        // Subscribe to typing notifications
        if (onTypingUpdate) {
            const typingSub = webSocketService.subscribe<TypingNotification>(
                `/topic/chat/${chatId}/typing`,
                (data) => {
                    onTypingUpdate(data.username, data.typing);
                }
            );
            subscriptions.current.set(`typing-${chatId}`, typingSub);
        }

        // Subscribe to personal notifications
        const notificationSub = webSocketService.subscribe(
            `/user/queue/notifications`,
            (notification) => {
                console.log('Personal notification:', notification);
            }
        );
        subscriptions.current.set('notifications', notificationSub);

        // Subscribe to errors
        const errorSub = webSocketService.subscribe(
            `/user/queue/errors`,
            (error) => {
                console.error('WebSocket error:', error);
            }
        );
        subscriptions.current.set('errors', errorSub);

    }, [chatId, onMessageReceived, onTypingUpdate]);

    const unsubscribeFromChat = useCallback(() => {
        subscriptions.current.forEach((subscriptionId, key) => {
            webSocketService.unsubscribe(subscriptionId);
        });
        subscriptions.current.clear();
    }, []);

    // Connection management
    useEffect(() => {
        const handleConnectionChange = (connected: boolean) => {
            onConnectionChange?.(connected);
            if (connected && chatId) {
                subscribeToChat();
            } else {
                unsubscribeFromChat();
            }
        };

        webSocketService.onConnectionChange(handleConnectionChange);

        // Initial connection
        webSocketService.connect().then(() => {
            if (chatId) {
                subscribeToChat();
            }
        }).catch(error => {
            console.error('Failed to connect WebSocket:', error);
        });

        return () => {
            unsubscribeFromChat();
            // Note: We don't disconnect WebSocket completely as it might be used by other components
        };
    }, [chatId, subscribeToChat, unsubscribeFromChat, onConnectionChange]);

    return {
        sendMessage,
        sendTyping,
        isConnected: webSocketService.getIsConnected()
    };
};