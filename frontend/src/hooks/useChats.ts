import {useState, useEffect, useCallback} from 'react';
import type {ChatItem, UserItem} from '../types/chat';
import {chatService} from '../services/chatService';

export const useChats = () => {
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadChats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const chatsData = await chatService.getChats();
            setChats(chatsData.chats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load chats');
            console.error('Failed to load chats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createChat = useCallback(async (user: UserItem) => {
        try {
            const chatItem = await chatService.createPrivateChat(Number.parseInt(user.id));
            setChats(prev => [chatItem, ...prev]);
            return chatItem;
        } catch (err) {
            console.error('Failed to create chat:', err);
            throw err;
        }
    }, []);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    return {
        chats,
        loading,
        error,
        loadChats,
        createChat,
    };
};