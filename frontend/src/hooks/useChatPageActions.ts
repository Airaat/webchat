import type {ChatItem, ChatListData, UserItem} from '../types/chat';
import {chatService} from '../services/chatService';
import {type InfiniteData, useQueryClient} from "@tanstack/react-query";
import {useChatUIStore} from '../store/chatUIStore';

export const useChatPageActions = () => {
    const setSelectedChat = useChatUIStore((s) => s.setSelectedChat);
    const resetUnreadCount = useChatUIStore((s) => s.resetUnreadCount);

    const queryClient = useQueryClient();

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

    const selectChat = (chat: ChatItem) => {
        setSelectedChat(chat);
        resetUnreadCount(chat.id);
    }

    return {
        createChat,
        selectChat,
    };
};