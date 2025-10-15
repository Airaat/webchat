export type MessageType = 'TEXT' | 'FILE' | 'SYSTEM';

export interface Message {
    id: number;
    type: MessageType;
    content: string;
    chatId: number;
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

export interface TypingNotification {
    chatId: number;
    username: string;
    typing: boolean;
    timestamp: Date;
}

export interface ChatNotification {
    chatId: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    lastMessage: string;
    lastMessageAt: Date;
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
    lastMessageAt: Date;
    mutedUntil?: Date;
    unreadCount?: number;
    isOnline?: boolean;
}

export interface PaginatedMessages {
    content: Message[];
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface UserItem {
    id: string;
    username: string;
    isActive: boolean;
    role: 'COMMON' | 'ADMIN';
    lastLoginAt?: Date;
}