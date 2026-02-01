import {useEffect, useRef} from "react";
import type {Message, ChatNotification} from "../types/chat";
import {webSocketService} from "../services/websocketService";

interface UseNotificationsProps {
    onMessageReceived: (message: Message) => void;
    onNotificationReceived: (notification: ChatNotification) => void;
}

export const useNotifications = ({
                                     onMessageReceived,
                                     onNotificationReceived
                                 }: UseNotificationsProps) => {
    const subscriptions = useRef<Map<string, string>>(new Map());
    const callbackRef = useRef({
        onMessageReceived,
        onNotificationReceived
    });

    useEffect(() => {
        callbackRef.current = {
            onMessageReceived,
            onNotificationReceived
        };
    });

    useEffect(() => {
        const subscribeToMessages = () => {
            if (subscriptions.current.has('messages')) return;

            const messageSub = webSocketService.subscribe<Message>(
                '/user/queue/messages',
                callbackRef.current.onMessageReceived
            );
            subscriptions.current.set('messages', messageSub);
        };

        const subscribeToNotifications = () => {
            // TODO: handle chatCreated, chatDeleted, chatUpdated, newMessage, messageDeleted
            if (subscriptions.current.has('notifications')) return;
            const notificationSub = webSocketService.subscribe<ChatNotification>(
                '/user/queue/notifications',
                callbackRef.current.onNotificationReceived
            );
            subscriptions.current.set('notifications', notificationSub);
        };

        const subscribeToErrors = () => {
            if (subscriptions.current.has('errors')) return;

            const errorSub = webSocketService.subscribe(
                '/user/queue/errors',
                (error) => console.error('WebSocket error:', error)
            );
            subscriptions.current.set('errors', errorSub);
        }

        const handleConnectionChange = (connected: boolean) => {
            if (connected) {
                subscribeToNotifications();
                subscribeToMessages();
                subscribeToErrors();
            }
        };

        // Initial connection
        webSocketService.connect()
            .then(() => handleConnectionChange(true))
            .catch(error => console.error('Failed to connect WebSocket:', error));
        webSocketService.onConnectionChange(handleConnectionChange);

        return () => {
            subscriptions.current.forEach(sub => webSocketService.unsubscribe(sub));
            subscriptions.current.clear();
        };
    }, []);
}
