import React from 'react'
import type {ChatItem, ChatSearchData, UserItem} from '../../../types/chat';
import {UserListItem} from './UserListItem';
import {List, ListItem, ListItemText} from '@mui/material';
import {listStyles} from '../../../styles/chatLists';
import {ChatListItem} from "./ChatListItem";

export interface SearchResultsProps {
    searchResults: ChatSearchData;
    isSearching: boolean;
    onChatSelect: (chat: ChatItem) => void;
    onUserSelect: (user: UserItem) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
                                                                isSearching,
                                                                searchResults,
                                                                onChatSelect,
                                                                onUserSelect,
                                                            }) => {
    const {chats, users} = searchResults;
    const hasChats = chats.length > 0;
    const hasUsers = users.length > 0;
    const hasEmptyResult = !hasChats && !hasUsers;

    return (
        <List sx={listStyles}>
            {hasEmptyResult && (
                <ListItem>
                    <ListItemText
                        primary={isSearching ? "Searching..." : "No users found"}
                        sx={{textAlign: 'center', color: 'text.secondary'}}
                    />
                </ListItem>
            )}

            {hasChats && (
                chats.map((chat) => (
                    <ChatListItem
                        key={`chat-item-${chat.id}`}
                        chat={chat}
                        isSelected={false}
                        onSelect={onChatSelect}
                    />
                ))
            )}

            {hasUsers && (
                users.map((user) => (
                    <UserListItem
                        key={`user-item-${user.id}`}
                        user={user}
                        onSelect={onUserSelect}
                    />
                ))
            )}
        </List>
    );
};