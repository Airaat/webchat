import React from 'react';
import {Box} from '@mui/material';
import type {ChatItem, UserItem} from '../../../types/chat';
import {useUserSearch} from '../../../hooks/useUserSearch';
import {SearchBar} from './SearchBar';
import {ChatList} from './ChatList';
import {SearchResults} from './SearchResults';
import {Loader} from '../../ui/Feedback/Loader';
import {useChats} from "../../../hooks/useChats";

interface ChatMenuProps {
    chats: ChatItem[];
    onChatSelect: (chat: ChatItem) => void;
    onChatCreate: (user: UserItem) => Promise<ChatItem>;
    selectedChatId?: number;
}

export const ChatMenu: React.FC<ChatMenuProps> = ({
                                                      chats,
                                                      onChatCreate,
                                                      onChatSelect,
                                                      selectedChatId,
                                                  }) => {
    const {
        searchResults,
        searchTerm,
        isSearching,
        resetSearch,
        setSearchTerm,
    } = useUserSearch();
    const {isLoading} = useChats();

    const handleUserSelect = async (user: UserItem) => {
        const newChat = await onChatCreate(user);
        onChatSelect(newChat);
        resetSearch();
    };

    const handleChatSelect = (chat: ChatItem) => {
        onChatSelect(chat);
        resetSearch();
    };

    const isSearchActive = isSearching || searchTerm.trim() !== '';
    const showSearchResults = isSearchActive && !isLoading;
    const showChatList = !isSearchActive && !isLoading;

    return (
        <Box
            sx={{
                width: 320,
                flexShrink: 0,
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

            {isLoading && <Loader/>}

            {showSearchResults && (
                <SearchResults
                    searchResults={searchResults}
                    isSearching={isSearching}
                    onChatSelect={handleChatSelect}
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