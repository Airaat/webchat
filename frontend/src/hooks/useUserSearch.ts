import {useCallback, useEffect, useState} from 'react';
import type {ChatSearchData} from '../types/chat';
import {chatService} from '../services/chatService';

export const useUserSearch = () => {
    const [searchResults, setSearchResults] = useState<ChatSearchData>({chats: [], users: []});
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults({chats: [], users: []});
            setIsSearching(false);
            return;
        }

        const searchChats = async () => {
            try {
                setIsSearching(true);
                const results = await chatService.searchChatsAndUsers(searchTerm);
                setSearchResults(results);
            } catch (err) {
                setSearchResults({chats: [], users: []});
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchChats, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const resetSearch = useCallback(() => {
        setSearchTerm('');
        setSearchResults({chats: [], users: []});
        setIsSearching(false);
    }, []);

    return {
        searchResults,
        searchTerm,
        isSearching,
        resetSearch,
        setSearchTerm,
    };
};