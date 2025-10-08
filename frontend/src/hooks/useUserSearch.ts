import {useState, useCallback, useEffect} from 'react';
import type {UserItem} from '../types/chat';
import {chatService} from '../services/chatService';

export const useUserSearch = () => {
    const [searchResults, setSearchResults] = useState<UserItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchUsers = useCallback(async (username: string) => {
        if (!username.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        try {
            setIsSearching(true);
            setError(null);
            const users = await chatService.searchUsers(username);
            setSearchResults(users);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search users');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchUsers(searchTerm);
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, searchUsers]);

    const resetSearch = useCallback(() => {
        setSearchTerm('');
        setSearchResults([]);
        setIsSearching(false);
    }, []);

    return {
        searchResults,
        searchTerm,
        setSearchTerm,
        isSearching,
        error,
        resetSearch,
    };
};