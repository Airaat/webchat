import {apiClient} from "../core/apiClient";
import type {ChatItem, ChatListData, MessagePageResponse, ChatSearchData, PaginationOptions} from "../types/chat";

class ChatService {
    async getChats(page: number): Promise<ChatListData> {
        return apiClient.get<ChatListData>(`/chats?page=${page}`);
    }

    async getChatMessages(
        chatId: number,
        options: PaginationOptions = {}
    ): Promise<MessagePageResponse> {
        const {cursor, limit} = options;
        const params = new URLSearchParams();

        if (cursor) params.set('cursor', cursor);
        if (limit) params.set('limit', limit.toString());

        return apiClient.get<MessagePageResponse>(`/chats/${chatId}/messages?${params}`);
    }

    async searchChatsAndUsers(query: string): Promise<ChatSearchData> {
        return apiClient.get<ChatSearchData>(`/chats/search?q=${encodeURIComponent(query)}`);
    }

    async createPrivateChat(userId: number): Promise<ChatItem> {
        return apiClient.post<ChatItem>('/chats', {
            chatType: 'PRIVATE',
            userIds: [userId]
        });
    }
}

export const chatService = new ChatService();