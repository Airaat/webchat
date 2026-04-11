import {useCallback, useEffect, useState} from 'react';
import type {ChatItem, ChatNotification, Message, MessagePageResponse, UserItem, UserPresence} from '../types/chat';
import {chatService} from '../services/chatService';
import {useNotifications} from "./useNotifications";
import {usePresence} from "./usePresence.ts";
import {selectMessages, useMessages} from "./useMessages";
import {type InfiniteData, useQueryClient} from "@tanstack/react-query";

export const useChatPage = () => {
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const queryClient = useQueryClient();

    const {data, hasNextPage, isFetchingNextPage, fetchNextPage} = useMessages(selectedChat?.id);
    const messages = selectMessages(data);

    // ── Initialization ────────────────────────────────────────────
    useEffect(() => {
        const loadChats = async () => {
            try {
                setLoading(true);
                const {chats} = await chatService.getChats();
                setChats(chats);
            } catch (err) {
                console.error('Failed to load chats:', err);
            } finally {
                setLoading(false);
            }
        }
        loadChats();
    }, []);
    usePresence();

    // ── Actions ───────────────────────────────────────────────────
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

    const selectChat = (chat: ChatItem) => setSelectedChat(chat);

    const loadMoreMessages = useCallback(async () => {
        if (!selectedChat || !hasNextPage || isFetchingNextPage) return;
        console.log("Loading more messages for chat:", selectedChat.id);
        await fetchNextPage();
    }, [selectedChat, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ── Notification handlers ─────────────────────────────────────
    const handleMessageReceived = useCallback(
        (msg: Message) => {
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

            console.log("receiveMessage fired", msg);
            queryClient.setQueryData<InfiniteData<MessagePageResponse>>(
                ['messages', msg.chatId],
                (old) => {
                    if (!old) return old;
                    const firstPage = old.pages[0];
                    const updatedFirstPage: MessagePageResponse = {
                        ...firstPage,
                        messages: [...firstPage.messages, msg],
                        pageInfo: {
                            ...firstPage.pageInfo,
                            totalCount: firstPage.pageInfo.totalCount + 1
                        }
                    };

                    return {
                        ...old,
                        pages: [updatedFirstPage, ...old.pages.slice(1)]
                    }
                }
            );
        },
        [queryClient]
    );

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

    useNotifications({
        onMessageReceived: handleMessageReceived,
        onNotificationReceived: handleChatNotification,
        onPresenceUpdate: handlePresenceNotification
    });

    return {
        chats,
        loading,
        messages,
        selectedChat,
        createChat,
        selectChat,
        loadMoreMessages,
    };
};