import React from 'react';
import {Box} from '@mui/material';
import type {ChatItem, UserItem} from '../../../types/chat';
import {useUserSearch} from '../../../hooks/useUserSearch';
import {SearchBar} from './SearchBar';
import {ChatList} from './ChatList';
import {SearchResults} from './SearchResults';
import {Loader} from '../../ui/Feedback/Loader';
import {selectChats, useChats} from "../../../hooks/useChats";
import {useChatUIStore} from "../../../store/chatUIStore";
import {useChatPageActions} from "../../../hooks/useChatPageActions";


export const ChatMenu: React.FC = () => {
    const selectedChat = useChatUIStore((s) => s.selectedChat);
    const {data, isLoading} = useChats();
    const chats = selectChats(data);
    const {
        searchResults,
        searchTerm,
        isSearching,
        resetSearch,
        setSearchTerm,
    } = useUserSearch();
    const {createChat, selectChat} = useChatPageActions();

    const handleUserSelect = async (user: UserItem) => {
        const newChat = await createChat(user);
        selectChat(newChat);
        resetSearch();
    };

    const handleChatSelect = (chat: ChatItem) => {
        selectChat(chat);
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
                    selectedChatId={selectedChat?.id}
                    onChatSelect={handleChatSelect}
                    emptyMessage="No chats yet"
                />
            )}
        </Box>
    );
};