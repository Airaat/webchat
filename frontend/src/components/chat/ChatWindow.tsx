import React, {useEffect, useRef, useState} from 'react';
import {Box, Button, List, ListItem, ListItemText} from "@mui/material";
import {TextField} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import type {Message} from '../../types/chat';
import type {User} from "../../types/auth.ts";

interface ChatWindowProps {
    user?: User;
    messages: Message[];
    onSendMessage: (msg: Message) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({user, messages, onSendMessage}) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!currentMessage.trim()) return;
        const newMessage: Message = {
            id: Date.now(),
            user: user?.username || '[system]',
            content: currentMessage,
            timestamp: new Date()
        };

        onSendMessage(newMessage);
        setCurrentMessage('');
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Box
            id="chat-window"
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                maxWidth: '800px',
                margin: '0 auto',
                gap: 2
            }}
        >
            <List
                sx={{
                    flex: 1,
                    p: 2,
                    width: '100%',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                }}
            >
                {messages.map((message) => (
                    <ListItem
                        key={message.id}
                        sx={{
                            py: 1,
                            width: '100%',
                            display: 'block'
                        }}
                    >
                        <ListItemText
                            primary={`${message.user}: ${message.content}`}
                            secondary={message.timestamp.toLocaleDateString()}
                            sx={{
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                '& .MuiListItemText-primary': {
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                },
                                '& .MuiListItemText-secondary': {
                                    whiteSpace: 'normal',
                                }
                            }}
                        />
                    </ListItem>
                ))}
                <div ref={messagesEndRef}/>
            </List>
            <Box
                className="input-container"
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
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    sx={{
                        '& .MuiInputBase-root': {
                            // Ensure text field doesn't cause layout issues
                            alignItems: 'flex-start', // Better for multi-line
                        }
                    }}
                    multiline
                    maxRows={3}
                />

                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    sx={{
                        alignSelf: 'flex-end',
                        height: '56px',
                        width: '56px'
                    }}
                >
                    <SendIcon/>
                </Button>
            </Box>
        </Box>
    );
}