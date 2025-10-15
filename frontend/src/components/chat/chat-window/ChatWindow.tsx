import React, {useState, useCallback} from 'react';
import {Box} from '@mui/material';
import type {ChatItem, Message, MessageRequest} from '../../../types/chat';
import type {User} from '../../../types/auth'
import {useChatWebSocket} from '../../../hooks/useChatWebSocket';
import {ChatHeader} from './ChatHeader';
import {MessageList} from './MessageList';
import {InputArea} from './InputArea';
import {useTypingIndicator} from '../../../hooks/useTypingIndicator';

interface ChatWindowProps {
    user: User;
    chat: ChatItem | null;
    messages: Message[];
    onNewMessage: (message: Message) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
                                                          user,
                                                          chat,
                                                          messages,
                                                          onNewMessage,
                                                      }) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

    const handleMessageReceived = useCallback((newMessage: Message) => {
        onNewMessage(newMessage);
    }, [onNewMessage]);

    const handleTypingUpdate = useCallback((username: string, typing: boolean) => {
        setTypingUsers(prev => {
            const updated = new Set(prev);
            if (typing && username !== user.username) {
                updated.add(username);
            } else {
                updated.delete(username);
            }
            return updated;
        });
    }, [user.username]);

    const handleConnectionChange = useCallback((connected: boolean) => {
        setConnectionStatus(connected ? 'connected' : 'disconnected');
    }, []);

    const {sendMessage, sendTyping, isConnected} = useChatWebSocket({
        chatId: chat?.id,
        onMessageReceived: handleMessageReceived,
        onTypingUpdate: handleTypingUpdate,
        onConnectionChange: handleConnectionChange
    });

    const {isTyping, setIsTyping} = useTypingIndicator({
        currentMessage,
        sendTyping,
    })

    const handleSendMessage = () => {
        if (!currentMessage.trim()) return;
        const message: MessageRequest = {
            type: 'TEXT',
            content: currentMessage.trim(),
            authorId: user.id,
            authorUsername: user.username,
            timestamp: new Date()
        }

        sendMessage(message);
        setCurrentMessage('');

        // Stop typing indicator
        if (isTyping) {
            sendTyping(false);
            setIsTyping(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        // Start typing if we have content and aren't already typing
        if (!isTyping) {
            sendTyping(true);
            setIsTyping(true);
        }

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const isInputDisabled = !isConnected || !chat;
    const typingIndicatorText = typingUsers.size > 0
        ? `${Array.from(typingUsers).join(', ')} ${typingUsers.size === 1 ? 'is' : 'are'} typing...`
        : '';

    return (
        <Box
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                maxWidth: '1000px',
                margin: '0 auto',
                gap: 2
            }}
        >
            <ChatHeader
                chat={chat}
                connectionStatus={connectionStatus}
            />

            <MessageList
                messages={messages}
                indicatorText={typingIndicatorText}
            />

            <InputArea
                currentMessage={currentMessage}
                disabled={isInputDisabled}
                onMessageChange={setCurrentMessage}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
            />
        </Box>
    );
};