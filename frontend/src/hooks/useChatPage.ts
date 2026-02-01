import {useCallback, useEffect, useState} from 'react';
import type {ChatItem, ChatNotification, Message, UserItem} from '../types/chat';
import {chatService} from '../services/chatService';
import type {AuthContextType} from "../contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {useNotifications} from "./useNotifications";

export const useChatPage = (authContext: AuthContextType) => {
    const navigate = useNavigate();
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);

    // Auth check
    useEffect(() => {
        if (authContext.isLoading) return;

        if (authContext.user === null) {
            navigate('/login');
            return;
        }

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
    }, [authContext.isLoading, authContext.user, navigate]);

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
        const chatMessages = await chatService.getChatMessages(chat.id);
        setMessages(chatMessages.content);
    };

    const addMessage = useCallback((msg: Message) => {
        setMessages(prevMessages => [...prevMessages, msg]);
    }, []);

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

    useNotifications({
        onMessageReceived: addMessage,
        onNotificationReceived: handleChatNotification
    });

    const displayedMessages = selectedChat ? messages : [];

    return {
        chats,
        loading,
        messages: displayedMessages,
        selectedChat,
        createChat,
        selectChat,
    };
};