import {create} from "zustand";
import {devtools} from "zustand/middleware";
import type {ChatItem} from "../types/chat";

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface ChatUIStore {
    // connection
    connection: ConnectionStatus;
    setConnectionStatus: (status: ConnectionStatus) => void;

    // selected chat
    selectedChat: ChatItem | null;
    setSelectedChat: (chat: ChatItem | null) => void;

    /**
     * Scroll anchor: the ID of the first-visible message for each chat.
     * Keyed by chatId (number). Value is the message ID (number).
     *
     * undefined means "first visit" → scroll to bottom on open.
     * A stored value means "return visit" → restore that position.
     *
     * Replaces the previous index-based firstVisiblePerChat slice.
     * Session-only (no persistence middleware) — satisfies FR8.
     */
    scrollAnchors: Record<number, number>;
    setScrollAnchor: (chatId: number, messageId: number) => void;
    getScrollAnchor: (chatId: number) => number | undefined;
    clearScrollAnchor: (chatId: number) => void;

    // unread count per chat
    unreadCounts: Record<number, number>
    setUnreadCount: (chatId: number, count: number) => void;
    incrementUnreadCount: (chatId: number) => void;
    resetUnreadCount: (chatId: number) => void;

    // typing indicators per chat
    typingUsers: Record<number, Set<string>>
    addTypingUser: (chatId: number, username: string) => void;
    removeTypingUser: (chatId: number, username: string) => void;
}

export const useChatUIStore = create<ChatUIStore>()(
    devtools(
        // persist(
        (set, get) => ({
            connection: "disconnected",
            setConnectionStatus: (status) => set({connection: status}),

            selectedChat: null,
            setSelectedChat: (chat) => set({selectedChat: chat}),

            scrollAnchors: {},
            setScrollAnchor: (chatId, messageId) =>
                set((state) => ({
                    scrollAnchors: {...state.scrollAnchors, [chatId]: messageId},
                })),
            getScrollAnchor(chatId) {
                return get().scrollAnchors[chatId];
            },
            clearScrollAnchor(chatId) {
                set((state) => {
                    const next = {...state.scrollAnchors};
                    delete next[chatId];
                    return {scrollAnchors: next};
                });
            },

            unreadCounts: {},
            setUnreadCount: (chatId, count) =>
                set((state) => ({
                    unreadCounts: {...state.unreadCounts, [chatId]: count},
                })),
            incrementUnreadCount: (chatId) =>
                set((state) => {
                    const current = state.unreadCounts[chatId] || 0;
                    return {
                        unreadCounts: {...state.unreadCounts, [chatId]: current + 1},
                    };
                }),
            resetUnreadCount: (chatId) =>
                set((state) => ({
                    unreadCounts: {...state.unreadCounts, [chatId]: 0},
                })),

            typingUsers: {},
            addTypingUser: (chatId: number, username: string) =>
                set((state) => {
                    const current = state.typingUsers[chatId] || new Set();
                    current.add(username);
                    return {
                        typingUsers: {...state.typingUsers, [chatId]: current}
                    };
                }),
            removeTypingUser: (chatId: number, username: string) =>
                set((state) => {
                    const current = state.typingUsers[chatId] || new Set();
                    current.delete(username);
                    return {
                        typingUsers: {...state.typingUsers, [chatId]: current}
                    };
                }),
        }),
        //     {
        //         name: 'chat-ui-storage',
        //         partialize: state => ({
        //             selectedChatId: state.selectedChatId,
        //             unreadCounts: state.unreadCounts,
        //         }),
        //     }
        // ),
    )
);