import React from 'react';
import {Box, Tooltip, Typography} from '@mui/material';
import type {ChatItem} from '../../../types/chat';
import {useAuth} from "../../../hooks/useAuth.ts";

export interface ChatHeaderProps {
    chat: ChatItem | null;
    connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({chat, connectionStatus}) => {
    const authContext = useAuth();

    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant="h6">
                {chat ? `Chat ${chat.title}` : 'Select a chat'}
            </Typography>
            <Tooltip title="Click to log out">
                <Typography
                    variant="caption"
                    color={connectionStatus === 'connected' ? 'success.main' : 'error.main'}
                    onClick={authContext.logout}
                    sx={{cursor: 'pointer'}}
                >
                    {connectionStatus.toUpperCase()}
                </Typography>
            </Tooltip>
        </Box>
    );
};