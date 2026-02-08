import React from 'react';
import {ListItem, ListItemButton, Avatar, Typography, Box} from '@mui/material';
import type {ChatItem} from '../../../types/chat';
import {formatChatTime} from '../../../utils/dateUtils';

interface ChatListItemProps {
    chat: ChatItem;
    isSelected: boolean;
    onSelect: (chat: ChatItem) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = React.memo(({
                                                                         chat,
                                                                         isSelected,
                                                                         onSelect
                                                                     }) => {
    const hasUnreadMessages = (chat.unreadCount || 0) > 0;

    return (
        <ListItem disablePadding>
            <ListItemButton
                selected={isSelected}
                onClick={() => onSelect(chat)}
                sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                        '&:hover': {
                            backgroundColor: 'action.selected',
                        }
                    }
                }}
            >
                <Avatar
                    sx={{
                        width: 48,
                        height: 48,
                        mr: 2,
                        position: 'relative',
                        overflow: 'unset',
                        '&::after': chat.isOnline ? {
                            content: '""',
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            width: 12,
                            height: 12,
                            backgroundColor: 'success.main',
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: 'background.paper'
                        } : {}
                    }}
                >
                    {chat.title.charAt(0)}
                </Avatar>

                <Box sx={{flex: 1, minWidth: 0}}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5
                    }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 'medium',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {chat.title}
                        </Typography>
                        {chat.lastMessageAt && (
                            <Typography variant="caption" color="text.secondary">
                                {formatChatTime(chat.lastMessageAt)}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1
                            }}
                        >
                            {chat.lastMessage || 'No messages yet'}
                        </Typography>

                        {hasUnreadMessages && (
                            <Box
                                sx={{
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    ml: 1
                                }}
                            >
                                {chat.unreadCount}
                            </Box>
                        )}
                    </Box>
                </Box>
            </ListItemButton>
        </ListItem>
    );
});