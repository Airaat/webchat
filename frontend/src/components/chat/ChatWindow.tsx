import React, {useState} from 'react';
import {Box, Button, List, ListItem, ListItemText} from "@mui/material";
import {TextField} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import type {Message} from '../../types/chat';
import type {User} from "../../types/auth.ts";

interface ChatWindowProps {
    user?: User
}

export const ChatWindow: React.FC = ({user}: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');

    const handleSendMessage = () => {
        if (!currentMessage.trim()) return;
        const newMessage: Message = {
            id: Date.now(),
            user: user!.username,
            content: currentMessage,
            timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);
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
                m: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                minWidth: '800px',
                gap: 2
            }}
        >
            <List
                sx={{
                    p: 2,
                    width: '100%',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    height: '600px',
                    overflow: 'auto'
                }}
            >
                {messages.map((message) => (
                    <ListItem key={message.id} sx={{py: 1}}>
                        <ListItemText
                            primary={`${message.user}: ${message.content}`}
                            secondary={message.timestamp.toLocaleDateString()}
                            sx={{
                                textWrap: 'pretty',
                                // overflow: 'hidden'
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Box
                className="input-container"
                sx={{
                    display: 'flex',
                    flexFlow: 'row',
                    width: '100%',
                    gap: 1,
                }}
            >
                <TextField
                    variant="outlined"
                    fullWidth
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyUp={handleKeyPress}
                    placeholder="Type a message..."
                />

                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                >
                    <SendIcon/>
                </Button>
            </Box>
        </Box>
    );
}