import React, {useState, useCallback, useEffect} from 'react';
import {Box, Button, List, ListItem, ListItemText, TextField, Typography} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import type {Message, MessageRequest} from "../../types/chat";
import type {User} from '../../types/auth'
import {useChatWebSocket} from '../../hooks/useChatWebSocket';

interface ChatWindowProps {
    user: User;
    messages: Message[];
    onNewMessage: (message: Message) => void;
    chatId?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
                                                          user,
                                                          messages,
                                                          onNewMessage,
                                                          chatId
                                                      }) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

    const handleMessageReceived = useCallback((newMessage: Message) => {
        onNewMessage(newMessage);
    }, [onNewMessage]);

    const handleTypingUpdate = useCallback((username: string, isTyping: boolean) => {
        setTypingUsers(prev => {
            const updated = new Set(prev);
            if (isTyping) {
                updated.add(username);
            } else {
                updated.delete(username);
            }
            return updated;
        });
    }, []);

    const handleConnectionChange = useCallback((connected: boolean) => {
        setConnectionStatus(connected ? 'connected' : 'disconnected');
    }, []);

    const {sendMessage, sendTyping, isConnected} = useChatWebSocket({
        chatId,
        onMessageReceived: handleMessageReceived,
        onTypingUpdate: handleTypingUpdate,
        onConnectionChange: handleConnectionChange
    });

    // Typing indicator with debounce
    useEffect(() => {
        if (!currentMessage.trim()) {
            if (isTyping) {
                sendTyping(false);
                setIsTyping(false);
            }
            return;
        }

        if (!isTyping) {
            sendTyping(true);
            setIsTyping(true);
        }

        const timeoutId = setTimeout(() => {
            sendTyping(false);
            setIsTyping(false);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [currentMessage, isTyping, sendTyping]);

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
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

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
            {/* Connection Status */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="h6">
                    {chatId ? `Chat ${chatId}` : 'Select a chat'}
                </Typography>
                <Typography
                    variant="caption"
                    color={connectionStatus === 'connected' ? 'success.main' : 'error.main'}
                >
                    {connectionStatus.toUpperCase()}
                </Typography>
            </Box>

            {/* Messages List */}
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
                            primary={`${message.authorUsername}: ${message.content}`}
                            secondary={new Date(message.timestamp).toLocaleTimeString()}
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

                {/* Typing Indicator */}
                {typingIndicatorText && (
                    <ListItem>
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            {typingIndicatorText}
                        </Typography>
                    </ListItem>
                )}
            </List>

            {/* Input Area */}
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
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={!isConnected || !chatId}
                    multiline
                    maxRows={3}
                />

                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || !isConnected || !chatId}
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
};