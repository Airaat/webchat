import React from 'react';
import {List, ListItem, ListItemText} from '@mui/material';
import type {ChatItem} from '../../types/chat';
import {ChatListItem} from './ChatListItem';

interface ChatListProps {
    chats: ChatItem[];
    selectedChatId?: string;
    onChatSelect: (chat: ChatItem) => void;
    emptyMessage?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
                                                      chats,
                                                      selectedChatId,
                                                      onChatSelect,
                                                      emptyMessage = "No chats yet"
                                                  }) => {
    if (chats.length === 0) {
        return (
            <ListItem>
                <ListItemText
                    primary={emptyMessage}
                    sx={{textAlign: 'center', color: 'text.secondary'}}
                />
            </ListItem>
        );
    }

    return (
        <List>
            {chats.map((chat) => (
                <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    onSelect={onChatSelect}
                />
            ))}
        </List>
    );
};