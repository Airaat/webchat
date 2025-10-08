import React from 'react';
import {Box, List, ListItem, ListItemText} from '@mui/material';
import type {ChatItem, UserItem} from '../../types/chat';
import {useChats} from '../../hooks/useChats';
import {useUserSearch} from '../../hooks/useUserSearch';
import {SearchBar} from './SearchBar';
import {UserListItem} from './UserListItem';
import {ChatList} from './ChatList';

interface SideBarProps {
    onChatSelect: (chat: ChatItem) => void;
    selectedChatId?: string;
}

export const SideBar: React.FC<SideBarProps> = ({onChatSelect, selectedChatId}) => {
    const {chats, createChat} = useChats();
    const {
        searchResults,
        searchTerm,
        setSearchTerm,
        isSearching,
        resetSearch
    } = useUserSearch();

    const handleUserSelect = async (user: UserItem) => {
        try {
            const newChat = await createChat(user);
            onChatSelect(newChat);
            resetSearch();
        } catch (error) {
            // Error is already handled in the hook
        }
    };

    const handleChatSelect = (chat: ChatItem) => {
        onChatSelect(chat);
    };

    const isSearchActive = isSearching || searchTerm.trim() !== '';

    return (
        <Box
            sx={{
                width: 320,
                height: '100vh',
                borderRight: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper'
            }}
        >
            {/* Search Bar */}
            <Box sx={{p: 2, pb: 1}}>
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search users..."
                />
            </Box>

            {/* Chat/User List */}
            <List
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    py: 0,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'divider',
                        borderRadius: '4px',
                    },
                }}
            >
                {isSearchActive ? (
                    // Search results - users
                    searchResults.length > 0 ? (
                        searchResults.map((user) => (
                            <UserListItem
                                key={user.id}
                                user={user}
                                onSelect={handleUserSelect}
                            />
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText
                                primary={isSearching ? "Searching..." : "No users found"}
                                sx={{textAlign: 'center', color: 'text.secondary'}}
                            />
                        </ListItem>
                    )
                ) : (
                    // Existing chats
                    <ChatList
                        chats={chats}
                        selectedChatId={selectedChatId}
                        onChatSelect={handleChatSelect}
                        emptyMessage="No chats yet"
                    />
                )}
            </List>
        </Box>
    );
};