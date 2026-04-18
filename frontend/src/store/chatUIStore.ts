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

    // first visible message index per chat
    firstVisiblePerChat: Record<number, number>;
    setFirstVisiblePerChat: (chatId: number, index: number) => void;

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
        (set) => ({
            connection: "disconnected",
            setConnectionStatus: (status) => set({connection: status}),

            selectedChat: null,
            setSelectedChat: (chat) => set({selectedChat: chat}),

            firstVisiblePerChat: {},
            setFirstVisiblePerChat: (chatId, index) =>
                set((state) => ({
                    firstVisiblePerChat: {...state.firstVisiblePerChat, [chatId]: index},
                })),

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