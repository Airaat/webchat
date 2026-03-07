import {useCallback, useEffect, useRef, useState} from 'react';
import type {User} from "../types/auth";
import {webSocketClient} from "../core/webSocketClient";
import type {TypingRequest} from "../types/chat";

export interface UseTypingIndicatorProps {
    user: User;
    chatId?: string;
    currentMessage: string;
}

const TYPING_TIMEOUT = 1000;

export function useTypingIndicator({user, chatId, currentMessage}: UseTypingIndicatorProps) {
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const typingTimeoutRef = useRef<number>(null);
    const isTypingRef = useRef(false);

    const handleTypingUpdate = useCallback((username: string, typing: boolean) => {
        if (username === user.username) return;

        setTypingUsers(prev => {
            const hasUser = prev.has(username);
            if (typing === hasUser) return prev;

            const updated = new Set(prev);
            if (typing) {
                updated.add(username)
            } else {
                updated.delete(username);
            }
            return updated;
        });
    }, [user.username]);

    const sendTyping = useCallback((typing: boolean) => {
        if (!chatId) return;
        if (isTypingRef.current === typing) return;

        isTypingRef.current = typing;
        webSocketClient.send<TypingRequest>(`/app/chat/${chatId}/typing`, {typing});
    }, [chatId]);

    useEffect(() => {
        const hasContent = currentMessage.trim().length > 0;
        const clearTimer = () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }

        clearTimer();
        if (hasContent) {
            sendTyping(true);

            typingTimeoutRef.current = setTimeout(() => {
                sendTyping(false);
            }, TYPING_TIMEOUT);
        } else {
            sendTyping(false);
        }

        return clearTimer;
    }, [currentMessage, sendTyping]);

    return {
        typingUsers,
        handleTypingUpdate
    }
}