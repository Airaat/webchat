import type {ChatListData} from "../types/chat.ts";
import {type InfiniteData, useInfiniteQuery} from "@tanstack/react-query";
import {chatService} from "../services/chatService.ts";

export const useChats = () => {
    return useInfiniteQuery<ChatListData>({
        queryKey: ['chats'],
        queryFn: ({pageParam}) =>
            chatService.getChats(pageParam as number),
        initialPageParam: 0,
        getNextPageParam: lastPage => lastPage.hasNext ? lastPage.pageNumber + 1 : undefined,
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000 // 30 min
    });
}

export const selectChats = (data: InfiniteData<ChatListData> | undefined) => {
    if (!data) return [];
    return [...data.pages].flatMap(page => page.chats);
}