import React from 'react';
import {Box} from '@mui/material';
import type {ChatItem, UserItem} from '../../../types/chat';
import {useUserSearch} from '../../../hooks/useUserSearch';
import {SearchBar} from './SearchBar';
import {ChatList} from './ChatList';
import {SearchResults} from './SearchResults';
import {Loader} from '../../ui/Feedback/Loader';

interface ChatMenuProps {
    chats: ChatItem[];
    onChatSelect: (chat: ChatItem) => void;
    onChatCreate: (user: UserItem) => Promise<ChatItem>;
    selectedChatId?: string;
    loading?: boolean;
}

export const ChatMenu: React.FC<ChatMenuProps> = ({
                                                      chats,
                                                      onChatCreate,
                                                      onChatSelect,
                                                      selectedChatId,
                                                      loading = false
                                                  }) => {
    const {
        searchResults,
        searchTerm,
        setSearchTerm,
        isSearching,
        resetSearch
    } = useUserSearch();

    const handleUserSelect = async (user: UserItem) => {
        try {
            const newChat = await onChatCreate(user);
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
    const showSearchResults = isSearchActive && !loading;
    const showChatList = !isSearchActive && !loading;

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
            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search users..."
            />

            {loading && <Loader/>}

            {showSearchResults && (
                <SearchResults
                    searchResults={searchResults}
                    isSearching={isSearching}
                    onUserSelect={handleUserSelect}
                />
            )}

            {showChatList && (
                <ChatList
                    chats={chats}
                    selectedChatId={selectedChatId}
                    onChatSelect={handleChatSelect}
                    emptyMessage="No chats yet"
                />
            )}
        </Box>
    );
};