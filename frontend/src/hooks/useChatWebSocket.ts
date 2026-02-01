import {useCallback, useEffect, useRef} from 'react';
import {webSocketService} from '../services/websocketService';
import type {MessageRequest, TypingNotification, TypingRequest} from '../types/chat';

interface UseChatWebSocketProps {
    chatId?: string;
    onTypingUpdate: (username: string, isTyping: boolean) => void;
}

export const useChatWebSocket = ({
                                     chatId,
                                     onTypingUpdate,
                                 }: UseChatWebSocketProps) => {
    const chatIdRef = useRef(chatId)
    const onTypingUpdateRef = useRef(onTypingUpdate);

    useEffect(() => {
        chatIdRef.current = chatId;
        onTypingUpdateRef.current = onTypingUpdate;
    });

    useEffect(() => {
        const currentChatId = chatIdRef.current;
        if (!currentChatId) return;

        const typingSub = webSocketService.subscribe<TypingNotification>(
            `/topic/chat/${currentChatId}/typing`,
            ({username, typing}) => onTypingUpdateRef.current(username, typing)
        );

        return () => webSocketService.unsubscribe(typingSub);
    }, [chatId])

    const sendMessage = useCallback((message: MessageRequest) => {
        const currentChatId = chatIdRef.current;
        if (!currentChatId) return;
        webSocketService.send<MessageRequest>(`/app/chat/${currentChatId}/send`, message);
    }, []);

    const sendTyping = useCallback((typing: boolean) => {
        const currentChatId = chatIdRef.current;
        if (!currentChatId) return;
        webSocketService.send<TypingRequest>(`/app/chat/${currentChatId}/typing`, {typing});
    }, []);

    return {
        sendMessage,
        sendTyping,
        isConnected: webSocketService.getIsConnected()
    };
};