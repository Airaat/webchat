import React from 'react';
import {Box, Tooltip, Typography} from '@mui/material';
import type {ChatItem} from '../../../types/chat';
import {useAuth} from "../../../hooks/useAuth";

export interface ChatHeaderProps {
    chat: ChatItem | null;
    isConnected: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({chat, isConnected}) => {
    const authContext = useAuth();
    const connectionStatus = isConnected ? 'connected' : 'disconnected';

    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant="h6">
                {chat ? `Chat ${chat.title}` : 'Select a chat'}
            </Typography>
            <Tooltip title="Click to log out">
                <Typography
                    variant="caption"
                    color={isConnected ? 'success.main' : 'error.main'}
                    onClick={authContext.logout}
                    sx={{cursor: 'pointer'}}
                >
                    {connectionStatus.toUpperCase()}
                </Typography>
            </Tooltip>
        </Box>
    );
};