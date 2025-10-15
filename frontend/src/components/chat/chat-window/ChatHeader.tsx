import React from 'react';
import {Box, Typography} from '@mui/material';
import type {ChatItem} from '../../../types/chat';

export interface ChatHeaderProps {
    chat: ChatItem | null;
    connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({chat, connectionStatus}) => {
    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant="h6">
                {chat ? `Chat ${chat.title}` : 'Select a chat'}
            </Typography>
            <Typography
                variant="caption"
                color={connectionStatus === 'connected' ? 'success.main' : 'error.main'}
            >
                {connectionStatus.toUpperCase()}
            </Typography>
        </Box>
    );
};