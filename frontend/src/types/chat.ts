export interface Message {
    id: number;
    user: string;
    content: string;
    timestamp: Date;
}

export interface ChatItem {
    id: string;
    name: string;
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount?: number;
    isOnline?: boolean;
}