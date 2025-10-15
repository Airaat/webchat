import {useEffect, useState} from 'react';

export interface UseTypingIndicatorProps {
    currentMessage: string;

    sendTyping(typing: boolean): void;
}

export function useTypingIndicator({currentMessage, sendTyping}: UseTypingIndicatorProps) {
    const [isTyping, setIsTyping] = useState(false);

    // Handle typing start/stop
    useEffect(() => {
        if (!currentMessage.trim()) {
            if (isTyping) {
                sendTyping(false);
                setIsTyping(false);
            }
            return;
        }

        if (!isTyping) {
            sendTyping(true);
            setIsTyping(true);
        }
    }, [currentMessage, isTyping, sendTyping]);

    // Auto-stop typing after inactivity
    useEffect(() => {
        if (!isTyping) return;

        const timeoutId = setTimeout(() => {
            sendTyping(false);
            setIsTyping(false);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [currentMessage, isTyping, sendTyping]);

    return {isTyping, setIsTyping};
}