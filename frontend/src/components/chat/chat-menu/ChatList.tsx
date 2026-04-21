import React, {useMemo, useRef} from 'react';
import {List, ListItem, ListItemText} from '@mui/material';
import type {ChatItem} from '../../../types/chat';
import {ChatListItem} from './ChatListItem';
import {listStyles} from '../../../styles/chatLists';
import {useChats} from '../../../hooks/useChats';
import {selectChats} from "../../../hooks/useChats";
import {useInfiniteScroll} from "../../../hooks/useInfiniteScroll";

interface ChatListProps {
    selectedChatId?: number;
    onChatSelect: (chat: ChatItem) => void;
    emptyMessage?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
                                                      selectedChatId,
                                                      onChatSelect,
                                                      emptyMessage = "No chats yet"
                                                  }) => {

    const {data, fetchNextPage, hasNextPage, isFetchingNextPage} = useChats();
    const chats = useMemo(() => selectChats(data), [data]);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useInfiniteScroll({
        sentinelRef: sentinelRef,
        hasMore: hasNextPage,
        isLoading: isFetchingNextPage,
        onLoadMore: fetchNextPage,
    });

    return (
        <List sx={listStyles}>
            {chats.length > 0 ? (
                chats.map((chat) => (
                    <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onSelect={onChatSelect}
                    />
                ))
            ) : (
                <ListItem>
                    <ListItemText
                        primary={emptyMessage}
                        sx={{textAlign: 'center', color: 'text.secondary'}}
                    />
                </ListItem>
            )}
            {hasNextPage && <div ref={sentinelRef}/>}
        </List>
    );
};