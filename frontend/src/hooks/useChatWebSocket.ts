import {useCallback, useEffect, useRef, useState} from 'react';
import {webSocketClient} from '../core/webSocketClient';
import type {MessageRequest, TypingNotification} from '../types/chat';

interface UseChatWebSocketProps {
    chatId?: number;
    onTypingUpdate: (username: string, isTyping: boolean) => void;
}

export const useChatWebSocket = ({
                                     chatId,
                                     onTypingUpdate,
                                 }: UseChatWebSocketProps) => {
    const [connected, setConnected] = useState(false);
    const chatIdRef = useRef(chatId)
    const onTypingUpdateRef = useRef(onTypingUpdate);

    useEffect(() => {
        chatIdRef.current = chatId;
        onTypingUpdateRef.current = onTypingUpdate;
    });

    useEffect(() => {
        webSocketClient.onConnectionChange(conn => setConnected(conn));
    }, [setConnected]);

    useEffect(() => {
        const currentChatId = chatIdRef.current;
        if (!currentChatId) return;

        const typingSub = webSocketClient.subscribe<TypingNotification>(
            `/topic/chat/${currentChatId}/typing`,
            ({username, typing}) => onTypingUpdateRef.current(username, typing)
        );

        return () => webSocketClient.unsubscribe(typingSub);
    }, [chatId])

    const sendMessage = useCallback((message: MessageRequest) => {
        const currentChatId = chatIdRef.current;
        if (!currentChatId) return;
        webSocketClient.send<MessageRequest>(`/app/chat/${currentChatId}/send`, message);
    }, []);

    return {
        sendMessage,
        isConnected: connected
    };
};