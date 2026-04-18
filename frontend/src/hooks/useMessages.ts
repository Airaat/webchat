import type {Message, MessagePageResponse} from "../types/chat";
import {chatService} from "../services/chatService";
import {type InfiniteData, useInfiniteQuery} from "@tanstack/react-query";

/**
 * Fetches messages for a given chat with cursor-based pagination.
 * "Load more" means loading older messages (scrolling up).
 *
 * Page structure:
 * - No cursor → most recent N messages, ascending
 * - With prevCursor → N messages older than the cursor, ascending
 * - pages[0] = most recent page, pages[N] = oldest page
 */
export const useMessages = (chatId: number | null = null) => {
    return useInfiniteQuery<MessagePageResponse>({
        queryKey: ['messages', chatId],
        queryFn: ({pageParam}) =>
            chatService.getChatMessages(chatId!, {
                cursor: (pageParam as string) ?? null
            }),
        enabled: !!chatId,
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage.pageInfo.hasPrevious ? lastPage.pageInfo.prevCursor : null,
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,  // 30 min
    });
}

export const selectMessages = (data: InfiniteData<MessagePageResponse> | undefined): Message[] => {
    if (!data) return [];
    return [...data.pages]
        .reverse()
        .flatMap((page) => page.messages);
}