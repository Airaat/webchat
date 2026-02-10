import {useEffect, useRef} from "react";
import type {Message, ChatNotification, UserPresence} from "../types/chat";
import {webSocketClient} from "../core/webSocketClient";

interface UseNotificationsProps {
    onMessageReceived: (message: Message) => void;
    onNotificationReceived: (notification: ChatNotification) => void;
    onPresenceUpdate: (presence: UserPresence) => void;
}

export const useNotifications = ({
                                     onMessageReceived,
                                     onNotificationReceived,
                                     onPresenceUpdate,
                                 }: UseNotificationsProps) => {
    const subscriptions = useRef<Map<string, string>>(new Map());
    const callbackRef = useRef({
        onMessageReceived,
        onNotificationReceived,
        onPresenceUpdate,
    });

    useEffect(() => {
        callbackRef.current = {
            onMessageReceived,
            onNotificationReceived,
            onPresenceUpdate,
        };
    });

    useEffect(() => {
        const subscribeToMessages = () => {
            if (subscriptions.current.has('messages')) return;

            const messageSub = webSocketClient.subscribe<Message>(
                '/user/queue/messages',
                callbackRef.current.onMessageReceived
            );
            subscriptions.current.set('messages', messageSub);
        };

        const subscribeToPresence = () => {
            if (subscriptions.current.has('presence')) return;

            const presenceSub = webSocketClient.subscribe<UserPresence>(
                '/user/queue/presence',
                callbackRef.current.onPresenceUpdate
            );
            subscriptions.current.set('presence', presenceSub);
        };

        const subscribeToNotifications = () => {
            // TODO: handle chatCreated, chatDeleted, chatUpdated, newMessage, messageDeleted
            if (subscriptions.current.has('notifications')) return;
            const notificationSub = webSocketClient.subscribe<ChatNotification>(
                '/user/queue/notifications',
                callbackRef.current.onNotificationReceived
            );
            subscriptions.current.set('notifications', notificationSub);
        };

        const subscribeToErrors = () => {
            if (subscriptions.current.has('errors')) return;

            const errorSub = webSocketClient.subscribe(
                '/user/queue/errors',
                (error) => console.error('WebSocket error:', error)
            );
            subscriptions.current.set('errors', errorSub);
        }

        const handleConnectionChange = (connected: boolean) => {
            if (connected) {
                subscribeToNotifications();
                subscribeToPresence();
                subscribeToMessages();
                subscribeToErrors();
            }
        };

        // Initial connection
        webSocketClient.connect()
            .catch(error => console.error('Failed to connect WebSocket:', error));
        webSocketClient.onConnectionChange(handleConnectionChange);

        return () => {
            subscriptions.current.forEach(sub => webSocketClient.unsubscribe(sub));
            subscriptions.current.clear();
            webSocketClient.disconnect();
        };
    }, []);
}
