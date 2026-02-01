import React, {useEffect, useRef} from 'react';
import {List, ListItem, ListItemText, Typography} from '@mui/material';
import type {Message} from '../../../types/chat';
import {formatMessageTimestamp} from "../../../utils/dateUtils";

export interface MessageListProps {
    messages: Message[];
    indicatorText: string;
}

export const MessageList: React.FC<MessageListProps> = ({messages, indicatorText}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    return (
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
                        secondary={formatMessageTimestamp(message.timestamp.toString())}
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

            {/* Typing Indicator */}
            {indicatorText && (
                <ListItem>
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        {indicatorText}
                    </Typography>
                </ListItem>
            )}
        </List>
    );

};