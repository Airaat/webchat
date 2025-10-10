import {authService} from "./authService.ts";
import type {ChatItem, ChatListData, PaginatedMessages, UserItem} from "../types/chat.ts";
import {CHAT_URL, USER_URL} from "../const.ts";

class ChatService {
    private readonly token: string | null;
    private readonly headers: HeadersInit;

    constructor() {
        this.token = authService.getToken();
        this.headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        }
    }

    async getChats(): Promise<ChatListData> {
        const response = await fetch(CHAT_URL, {
            method: 'GET',
            headers: this.headers,
        })

        if (!response.ok) {
            throw new Error('Failed to fetch chats');
        }

        return await response.json();
    }

    async getChatMessages(chatId: string, page: number = 0, size: number = 50): Promise<PaginatedMessages> {
        const params = new URLSearchParams({
            p: page.toString(),
            s: size.toString(),
        }).toString();

        const response = await fetch(`${CHAT_URL}/${chatId}/messages?${params}`, {
            method: 'GET',
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch chat');
        }

        return await response.json();
    }

    async searchUsers(username: string): Promise<UserItem[]> {
        const response = await fetch(`${USER_URL}/find?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error('Failed to search users');
        }

        return await response.json();
    }

    async createPrivateChat(userId: number): Promise<ChatItem> {
        const response = await fetch(CHAT_URL, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                chatType: 'PRIVATE',
                userIds: [userId]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to search users');
        }

        return await response.json();
    }
}

export const chatService = new ChatService();