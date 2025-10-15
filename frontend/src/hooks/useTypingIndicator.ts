import {useEffect, useRef} from 'react';

export interface UseTypingIndicatorProps {
    currentMessage: string;

    sendTyping(typing: boolean): void;
}

export function useTypingIndicator({currentMessage, sendTyping}: UseTypingIndicatorProps) {
    const typingTimeoutRef = useRef<number | undefined>(undefined);
    const hasSentTypingRef = useRef(false);

    useEffect(() => {
        if (currentMessage.trim() && !hasSentTypingRef.current) {
            sendTyping(true);
            hasSentTypingRef.current = true;
        }
    }, [currentMessage, sendTyping]);

    useEffect(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (currentMessage.trim()) {
            typingTimeoutRef.current = setTimeout(() => {
                if (hasSentTypingRef.current) {
                    sendTyping(false);
                    hasSentTypingRef.current = false;
                }
            }, 1000);
        } else {
            if (hasSentTypingRef.current) {
                sendTyping(false);
                hasSentTypingRef.current = false;
            }
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [currentMessage, sendTyping]);
}