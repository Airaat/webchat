import React from 'react';
import {Box, Button, TextField} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface InputAreaProps {
    currentMessage: string;
    disabled?: boolean;
    onMessageChange: (message: string) => void;
    onSendMessage: () => void;
    onKeyPress: (event: React.KeyboardEvent) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
                                                        currentMessage,
                                                        onMessageChange,
                                                        onSendMessage,
                                                        onKeyPress,
                                                        disabled = false
                                                    }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexFlow: 'row',
                width: '100%',
                gap: 1,
                flexShrink: 0,
            }}
        >
            <TextField
                variant="outlined"
                fullWidth
                value={currentMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                onKeyDown={onKeyPress}
                placeholder="Type a message..."
                disabled={disabled}
                multiline
                maxRows={3}
            />

            <Button
                variant="contained"
                onClick={onSendMessage}
                disabled={!currentMessage.trim() || disabled}
                sx={{
                    alignSelf: 'flex-end',
                    height: '56px',
                    width: '56px'
                }}
            >
                <SendIcon/>
            </Button>
        </Box>
    );
};