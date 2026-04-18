import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
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
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
                                                          user,
                                                          chat,
                                                          messages,
                                                      }) => {
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

        const message: MessageRequest = {
            type: 'TEXT',
            content: currentMessage.trim(),
            authorId: user.id,
            authorUsername: user.username,
            timestamp: new Date()
        }

        sendMessage(message);
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