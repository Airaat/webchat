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

export interface TypingRequest {
    typing: boolean;
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

export interface ChatSearchData {
    chats: ChatItem[];
    users: UserItem[];
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
    userId?: number;
}

export interface PageInfo {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
    hasPrevious: boolean;
    totalCount: number;
}

export interface MessagePageResponse {
    messages: Message[];
    pageInfo: PageInfo;
}

export interface PaginationOptions {
    cursor?: string | null;
    limit?: number;
}

export interface PresenceRequest {
    isOnline: boolean;
}

export interface UserPresence {
    userId: number;
    online: boolean;
    lastSeenAt: string;
}

export interface UserItem {
    id: string;
    username: string;
    isActive: boolean;
    role: 'COMMON' | 'ADMIN';
    lastLoginAt?: Date;
}