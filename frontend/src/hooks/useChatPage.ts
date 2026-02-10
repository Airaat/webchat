import {useCallback, useEffect, useRef, useState} from 'react';
import type {ChatItem, ChatNotification, UserItem, UserPresence} from '../types/chat';
import {chatService} from '../services/chatService';
import {useNotifications} from "./useNotifications";
import {usePresence} from "./usePresence.ts";
import {usePaginatedMessages} from "./usePaginatedMessages.ts";

export const useChatPage = () => {
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const selectedChatRef = useRef(selectedChat);

    const {
        messages,
        pageInfo,
        hasMore,
        isLoadingMore,
        receiveMessage,
        fetchMessages,
    } = usePaginatedMessages(
        selectedChat?.id,
        (msg) => {
            setChats(prevChats => {
                const chatId = msg.chatId.toString();
                const target = prevChats.find((c) => c.id === chatId);
                if (!target) return prevChats;

                const updatedChat: ChatItem = {
                    ...target,
                    lastMessage: msg.content,
                    lastMessageAt: msg.timestamp,
                };
                return [updatedChat, ...prevChats.filter(chat => chat.id !== chatId)];
            });
        }
    );

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    });

    // initialization
    useEffect(() => {
        const loadChats = async () => {
            try {
                setLoading(true);
                const chatsData = await chatService.getChats();
                setChats(chatsData.chats);
            } catch (err) {
                console.error('Failed to load chats:', err);
            } finally {
                setLoading(false);
            }
        }

        loadChats();
    }, []);

    const createChat = async (user: UserItem): Promise<ChatItem> => {
        try {
            const chatItem = await chatService.createPrivateChat(Number.parseInt(user.id));
            setChats(prev => [chatItem, ...prev]);
            return chatItem;
        } catch (err) {
            console.error('Failed to create chat:', err);
            throw err;
        }
    };

    const selectChat = async (chat: ChatItem) => {
        setSelectedChat(chat);
        const chatId = chat.id.toString();

        if (!pageInfo) {
            console.log("Fetching initial messages for chat:", chatId);
            await fetchMessages(chatId);
        }
    };

    const loadMoreMessages = useCallback(async () => {
        if (!selectedChat || !hasMore || isLoadingMore) {
            return;
        }

        console.log("Loading more messages for chat:", selectedChat.id);
        await fetchMessages(selectedChat.id);
    }, [selectedChat, hasMore, isLoadingMore, fetchMessages]);

    const handleChatNotification = useCallback((notification: ChatNotification) => {
        setChats(prevChats => {
            const target = prevChats.find((c) => Number.parseInt(c.id) === notification.chatId);
            if (!target) return prevChats;

            const updatedChat: ChatItem = {
                ...target,
                lastMessage: notification.lastMessage,
                lastMessageAt: notification.lastMessageAt,
            };
            return [updatedChat, ...prevChats.filter(chat => chat.id !== target.id)];
        });
    }, []);

    const handlePresenceNotification = useCallback((presence: UserPresence) => {
        setChats(prevChats => prevChats.map(chat => {
            return chat.userId === presence.userId
                ? {...chat, isOnline: presence.online}
                : chat;
        }));
    }, []);

    usePresence();
    useNotifications({
        onMessageReceived: receiveMessage,
        onNotificationReceived: handleChatNotification,
        onPresenceUpdate: handlePresenceNotification
    });

    const displayedMessages = selectedChat ? messages : [];

    return {
        chats,
        loading,
        messages: displayedMessages,
        selectedChat,
        createChat,
        selectChat,
        loadMoreMessages,
    };
};