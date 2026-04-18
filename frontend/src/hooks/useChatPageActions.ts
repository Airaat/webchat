import {useCallback, useState} from 'react';
import type {ChatItem, ChatListData, UserItem} from '../types/chat';
import {chatService} from '../services/chatService';
import {selectMessages, useMessages} from "./useMessages";
import {type InfiniteData, useQueryClient} from "@tanstack/react-query";
import {selectChats, useChats} from "./useChats";

export const useChatPageActions = () => {
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const queryClient = useQueryClient();

    const {data: chatsData} = useChats();
    const chats = selectChats(chatsData);

    const {data, hasNextPage, isFetchingNextPage, fetchNextPage} = useMessages(selectedChat?.id);
    const messages = selectMessages(data);

    const createChat = async (user: UserItem): Promise<ChatItem> => {
        try {
            const chatItem = await chatService.createPrivateChat(user.id);
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

    return {
        chats,
        messages,
        selectedChat,
        createChat,
        selectChat,
        loadMoreMessages,
    };
};