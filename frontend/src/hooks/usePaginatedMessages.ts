import {useCallback, useEffect, useRef, useState} from "react";
import type {Message, MessagePageResponse, PageInfo} from "../types/chat";
import {chatService} from "../services/chatService";
import {LRUCache} from "../core/data-structures/LRUCache";

export interface UsePaginatedMessagesReturn {
    messages: Message[];
    pageInfo: PageInfo | null;
    hasMore: boolean;
    isLoadingMore: boolean;
    error: string | null;
    fetchMessages: (chatId: string) => Promise<Message[]>;
    receiveMessage: (msg: Message) => void;
}

const CACHE_SIZE = 20;

/**
 * Hook to manage paginated messages with LRU caching.
 *
 * Features:
 * - Caches messages per chat
 * - Handles incoming real-time messages
 * - Manages pagination state
 * - Prevents duplicate messages
 * - Handles concurrent fetch requests
 *
 * @param currChatId - Currently selected chat ID
 * @param onMessageReceived - Callback when new message arrives (for updating chat list)
 */
export const usePaginatedMessages = (
    currChatId: string | undefined,
    onMessageReceived?: (msg: Message) => void,
): UsePaginatedMessagesReturn => {
    const messageStore = useRef(new LRUCache<MessagePageResponse>(CACHE_SIZE));
    const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedChatId = useRef(currChatId);
    const loadingRequests = useRef<Map<string, Promise<Message[]>>>(new Map());

    useEffect(() => {
        const chatId = currChatId?.toString();
        selectedChatId.current = chatId;

        const cached = chatId ? messageStore.current.get(chatId) : undefined;
        const messages = cached?.messages || [];

        setDisplayedMessages(messages);
        setError(null);
    }, [currChatId]);

    const fetchMessages = useCallback(async (chatId?: string) => {
        if (!chatId) return [];

        const existingRequest = loadingRequests.current.get(chatId);
        if (existingRequest) {
            return existingRequest;
        }

        const requestPromise = (async () => {
            try {
                setIsLoadingMore(true);
                setError(null);

                const cached = messageStore.current.get(chatId);
                const response = await chatService.getChatMessages(chatId, {
                    cursor: cached?.pageInfo?.prevCursor,
                });

                if (cached) {
                    const mergedMessages = [...response.messages, ...cached.messages];

                    messageStore.current.put(chatId, {
                        messages: mergedMessages,
                        pageInfo: response.pageInfo
                    });
                } else {
                    messageStore.current.put(chatId, response);
                }

                if (selectedChatId.current?.toString() === chatId) {
                    setDisplayedMessages(prev => [...response.messages, ...prev]);
                }
                return response.messages;
            } catch (err) {
                setError(err as string);
                console.error(err);
                return [];
            } finally {
                setIsLoadingMore(false);
                loadingRequests.current.delete(chatId);
            }
        })();

        loadingRequests.current.set(chatId, requestPromise);
        return requestPromise;
    }, []);

    const receiveMessage = useCallback((msg: Message) => {
        const chatId = msg.chatId.toString();

        const cached = messageStore.current.get(chatId);

        if (cached) {
            const isDuplicate = cached.messages.some(m => m.id === msg.id);
            if (isDuplicate) {
                console.warn("Duplicate message received", msg.id);
                return;
            }

            const messages = [...cached.messages, msg];
            messageStore.current.put(chatId, {...cached, messages});
        }

        if (selectedChatId.current === chatId) {
            setDisplayedMessages(prev => [...prev, msg]);
        }
        onMessageReceived?.(msg);
    }, [onMessageReceived]);

    const currentPageInfo = currChatId
        ? messageStore.current.get(currChatId)?.pageInfo ?? null
        : null;

    const hasMore = currentPageInfo?.hasMore ?? false;

    return {
        messages: displayedMessages,
        pageInfo: currentPageInfo,
        hasMore,
        isLoadingMore,
        error,
        fetchMessages,
        receiveMessage
    };
}