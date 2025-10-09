export type MessageType = 'TEXT' | 'FILE' | 'SYSTEM';

export interface Message {
    id: number;
    type: MessageType;
    content: string;
    authorId: number;
    authorUsername: string;
    timestamp: Date;
    edited: boolean;
}

export interface MessageRequest {
    type: MessageType;
    content: string;
    authorId: number;
    authorUsername: string;
    timestamp: Date;
}

export interface ChatListData {
    chats: ChatItem[];
    length: number;
    hasNext: boolean;
    hasPrevious: boolean;
    pageNumber: number;
    totalItems: number;
    totalPages: number;
}

export interface ChatItem {
    id: string;
    title: string;
    type: 'PRIVATE' | 'GROUP';
    groupRole?: 'MEMBER' | 'ADMIN' | 'OWNER';
    lastMessage?: string;
    lastMessageAt?: Date;
    mutedUntil?: Date;
    unreadCount?: number;
    isOnline?: boolean;
}

export interface UserItem {
    id: string;
    username: string;
    isActive: boolean;
    role: 'COMMON' | 'ADMIN';
    lastLoginAt?: Date;
}