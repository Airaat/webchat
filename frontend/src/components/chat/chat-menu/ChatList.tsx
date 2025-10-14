import React from 'react';
import {List, ListItem, ListItemText} from '@mui/material';
import type {ChatItem} from '../../../types/chat';
import {ChatListItem} from './ChatListItem';
import {listStyles} from '../../../styles/chatLists';

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

    return (
        <List sx={listStyles}>
            {chats.length > 0 ? (
                chats.map((chat) => (
                    <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onSelect={onChatSelect}
                    />
                ))
            ) : (
                <ListItem>
                    <ListItemText
                        primary={emptyMessage}
                        sx={{textAlign: 'center', color: 'text.secondary'}}
                    />
                </ListItem>
            )}
        </List>
    );
};