import {apiClient} from "../core/apiClient";
import type {ChatItem, ChatListData, PaginatedMessages, UserItem} from "../types/chat";

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

    async searchUsers(username: string): Promise<UserItem[]> {
        return apiClient.get<UserItem[]>(`/users/find?username=${encodeURIComponent(username)}`);
    }

    async createPrivateChat(userId: number): Promise<ChatItem> {
        return apiClient.post<ChatItem>('/chats', JSON.stringify({
                chatType: 'PRIVATE',
                userIds: [userId]
            })
        );
    }
}

export const chatService = new ChatService();