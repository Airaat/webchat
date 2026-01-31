import {apiClient} from "../core/apiClient";
import type {ChatItem, ChatListData, PaginatedMessages, ChatSearchData} from "../types/chat";

class ChatService {
    async getChats(): Promise<ChatListData> {
        return apiClient.get<ChatListData>("/chats");
    }

    async getChatMessages(chatId: string, page: number = 0, size: number = 50): Promise<PaginatedMessages> {
        const params = new URLSearchParams({
            p: page.toString(),
            s: size.toString(),
        }).toString();

        return apiClient.get<PaginatedMessages>(`/chats/${chatId}/messages?${params}`);
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