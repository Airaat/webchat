import {useCallback, useState} from 'react';
import type {
    ChatItem,
    ChatListData,
    ChatNotification,
    Message,
    MessagePageResponse,
    UserItem,
    UserPresence
} from '../types/chat';
import {chatService} from '../services/chatService';
import {useNotifications} from "./useNotifications";
import {usePresence} from "./usePresence.ts";
import {selectMessages, useMessages} from "./useMessages";
import {type InfiniteData, useQueryClient} from "@tanstack/react-query";
import {selectChats, useChats} from "./useChats";

export const useChatPage = () => {
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const queryClient = useQueryClient();

    const {data: chatsData} = useChats();
    const chats = selectChats(chatsData);

    const {data, hasNextPage, isFetchingNextPage, fetchNextPage} = useMessages(selectedChat?.id);
    const messages = selectMessages(data);

    usePresence();

    // ── Actions ───────────────────────────────────────────────────
    const createChat = async (user: UserItem): Promise<ChatItem> => {
        try {
            const chatItem = await chatService.createPrivateChat(Number.parseInt(user.id));
            queryClient.setQueryData<InfiniteData<ChatListData>>(
                ['chats'],
                (old) => {
                    if (!old) return old;
                    const [firstPage, ...rest] = old.pages;
                    const updated: ChatListData = {
                        ...firstPage,
                        chats: [chatItem, ...firstPage.chats]
                    };
                    return {...old, pages: [updated, ...rest]};
                }
            );
            return chatItem;
        } catch (err) {
            console.error('Failed to create chat:', err);
            throw err;
        }
    };

    const selectChat = (chat: ChatItem) => setSelectedChat(chat);

    const loadMoreMessages = useCallback(() => {
        if (selectedChat && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [selectedChat, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ── Notification handlers ─────────────────────────────────────
    const handleMessageReceived = useCallback(
        (msg: Message) => {
            queryClient.setQueryData<InfiniteData<ChatListData>>(
                ['chats'],
                (old) => {
                    if (!old) return old;

                    const allChats = selectChats(old);
                    const target = allChats.find(c => c.id === msg.chatId);
                    if (!target) return old;

                    const updatedTarget: ChatItem = {
                        ...target,
                        lastMessage: msg.content,
                        lastMessageAt: msg.timestamp
                    };

                    const [firstPage, ...restPages] = old.pages;
                    const nonTargetChats = (c: ChatItem) => c.id !== msg.chatId;

                    return {
                        ...old,
                        pages: [
                            {
                                ...firstPage,
                                chats: [
                                    updatedTarget,
                                    ...firstPage.chats.filter(nonTargetChats)
                                ],
                            },
                            ...restPages.map(page => ({
                                ...page,
                                chats: page.chats.filter(nonTargetChats)
                            }))
                        ]
                    };
                }
            );

            queryClient.setQueryData<InfiniteData<MessagePageResponse>>(
                ['messages', msg.chatId],
                (old) => {
                    if (!old) return old;
                    const [firstPage, ...rest] = old.pages;
                    const updatedFirstPage: MessagePageResponse = {
                        ...firstPage,
                        messages: [...firstPage.messages, msg],
                    };

                    return {
                        ...old,
                        pages: [updatedFirstPage, ...rest]
                    }
                }
            );
        },
        [queryClient]
    );

    const handleChatNotification = useCallback((notification: ChatNotification) => {
        queryClient.setQueryData<InfiniteData<ChatListData>>(
            ['chats'],
            (old) => {
                // TODO: rewrite with REAL chat updates handling
                console.log("ignoring chat notification event: ", notification);
                return old;
            }
        )
    }, [queryClient]);

    const handlePresenceNotification = useCallback((presence: UserPresence) => {
        queryClient.setQueryData<InfiniteData<ChatListData>>(
            ['chats'],
            (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        chats: page.chats.map(chat => {
                            return chat.userId === presence.userId
                                ? {...chat, isOnline: presence.online}
                                : chat;
                        })
                    }))
                };
            }
        );
    }, [queryClient]);

    useNotifications({
        onMessageReceived: handleMessageReceived,
        onNotificationReceived: handleChatNotification,
        onPresenceUpdate: handlePresenceNotification
    });

    return {
        chats,
        messages,
        selectedChat,
        createChat,
        selectChat,
        loadMoreMessages,
    };
};