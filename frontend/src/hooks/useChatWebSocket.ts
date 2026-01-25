import {useEffect, useRef, useCallback} from 'react';
import {webSocketService} from '../services/websocketService';
import type {
    ChatNotification,
    Message,
    MessageRequest,
    TypingNotification,
    TypingRequest
} from '../types/chat';

interface UseChatWebSocketProps {
    chatId?: string;
    onMessageReceived: (message: Message) => void;
    onTypingUpdate?: (username: string, isTyping: boolean) => void;
    onConnectionChange?: (connected: boolean) => void;
    onNotificationReceived?: (notification: ChatNotification) => void;
}

export const useChatWebSocket = ({
                                     chatId,
                                     onMessageReceived,
                                     onTypingUpdate,
                                     onConnectionChange,
                                     onNotificationReceived
                                 }: UseChatWebSocketProps) => {
    const subscriptions = useRef<Map<string, string>>(new Map());

    const sendMessage = useCallback((message: MessageRequest) => {
        if (!chatId) {
            console.error('No chat selected');
            return;
        }

        webSocketService.send<MessageRequest>(`/app/chat/${chatId}/send`, message);
    }, [chatId]);

    const sendTyping = useCallback((typing: boolean) => {
        if (!chatId) return;

        webSocketService.send<TypingRequest>(`/app/chat/${chatId}/typing`, {typing});
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

        // Subscribe to errors
        const errorSub = webSocketService.subscribe(
            '/user/queue/errors',
            (error) => {
                console.error('WebSocket error:', error);
            }
        );
        subscriptions.current.set('errors', errorSub);

    }, [chatId, onMessageReceived, onTypingUpdate]);

    const subscribeToNotifications = useCallback(() => {
        // Subscribe to personal notifications
        const notificationSub = webSocketService.subscribe<ChatNotification>(
            '/user/queue/notifications',
            (notification) => {
                // TODO: handle chatCreated, chatDeleted, chatUpdated, newMessage, messageDeleted
                if (onNotificationReceived) {
                    onNotificationReceived(notification);
                }
            }
        );
        subscriptions.current.set('notifications', notificationSub);
    }, [onNotificationReceived]);

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
            if (connected) {
                subscribeToNotifications();
                if (chatId) {
                    subscribeToChat();
                }
            } else {
                unsubscribeFromChat();
            }
        };

        webSocketService.onConnectionChange(handleConnectionChange);

        // Initial connection
        webSocketService.connect().then(() => {
            subscribeToNotifications();
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
    }, [chatId, subscribeToChat, unsubscribeFromChat, onConnectionChange, subscribeToNotifications]);

    return {
        sendMessage,
        sendTyping,
        isConnected: webSocketService.getIsConnected()
    };
};