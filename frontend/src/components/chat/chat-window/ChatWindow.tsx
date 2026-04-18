import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
import type {User} from '../../../types/auth'
import {useChatWebSocket} from '../../../hooks/useChatWebSocket';
import {ChatHeader} from './ChatHeader';
import {MessageList} from './MessageList';
import {InputArea} from './InputArea';
import {useTypingIndicator} from '../../../hooks/useTypingIndicator';
import {selectMessages, useMessages} from "../../../hooks/useMessages";
import {useChatUIStore} from "../../../store/chatUIStore";

interface ChatWindowProps {
    user: User;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({user}) => {
    const chat = useChatUIStore((s) => s.selectedChat);
    const {data} = useMessages(chat?.id);
    const messages = selectMessages(data);
    const [currentMessage, setCurrentMessage] = useState('');
    const {typingUsers, handleTypingUpdate} = useTypingIndicator({
        user,
        chatId: chat?.id,
        currentMessage,
    });

    const {sendMessage, isConnected} = useChatWebSocket({
        chatId: chat?.id,
        onTypingUpdate: handleTypingUpdate,
    });

    const handleSendMessage = () => {
        if (!currentMessage.trim() || !chat) return;
        sendMessage({
            type: 'TEXT',
            content: currentMessage.trim(),
            authorId: user.id,
            authorUsername: user.username,
            timestamp: new Date()
        });
        setCurrentMessage('');
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const isInputDisabled = !isConnected || !chat;
    const typingIndicatorText = typingUsers.size > 0
        ? `${[...typingUsers].slice(0, 3).join(', ')} ${(typingUsers.size > 1 ? 'are' : 'is')} typing...`
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
            <ChatHeader/>

            <MessageList
                messages={messages}
            />

            {/* Typing Indicator */}
            {typingIndicatorText && (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    {typingIndicatorText}
                </Typography>
            )}

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