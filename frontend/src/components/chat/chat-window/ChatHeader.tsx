import React, {memo} from 'react';
import {Box, Tooltip, Typography} from '@mui/material';
import {useAuth} from "../../../hooks/useAuth";
import {useChatUIStore} from "../../../store/chatUIStore";

export const ChatHeader: React.FC = memo(() => {
    const authContext = useAuth();
    const chat = useChatUIStore((s) => s.selectedChat);
    const connectionStatus = useChatUIStore((s) => s.connection);
    const colorMap = {
        connected: 'success.main',
        connecting: 'info.main',
        disconnected: 'error.main',
    };

    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant="h6">
                {chat ? `Chat ${chat.title}` : 'Select a chat'}
            </Typography>
            <Tooltip title="Click to log out">
                <Typography
                    variant="caption"
                    color={colorMap[connectionStatus]}
                    onClick={authContext.logout}
                    sx={{cursor: 'pointer'}}
                >
                    {connectionStatus.toUpperCase()}
                </Typography>
            </Tooltip>
        </Box>
    );
});