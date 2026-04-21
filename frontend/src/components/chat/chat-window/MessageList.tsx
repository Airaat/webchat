import React, {memo, useCallback, useEffect, useMemo, useRef} from 'react';
import {List, ListItem, ListItemText} from '@mui/material';
import {formatMessageTimestamp} from "../../../utils/dateUtils";
import {selectMessages, useMessages} from "../../../hooks/useMessages";
import {useChatUIStore} from "../../../store/chatUIStore";
import {useScrollTracker} from "../../../hooks/useScrollTracker";
import {useScrollRestoration} from "../../../hooks/useScrollRestoration";
import { Loader } from '../../ui/Feedback/Loader';

export const MessageList: React.FC = memo(() => {
    const chat = useChatUIStore((s) => s.selectedChat);
    const {data, fetchNextPage, hasNextPage, isFetchingNextPage} = useMessages(chat?.id);

    // selectMessages already returns index-0=oldest order.
    const messages = useMemo(() => selectMessages(data), [data]);

    // Stable array of numeric message IDs, required by both scroll hooks.
    const messageIds = useMemo(() => messages.map((m) => m.id), [messages]);

    // ── Scroll container ref ───────────────────────────────────────────────────
    // The MUI <List> is the element with overflow-y: auto/scroll.
    // We use a callback ref so we get the DOM node on first render
    // without a second useEffect pass.
    const scrollContainerRef = useRef<HTMLElement>(null);

    // ── Infinite scroll: load older messages when user scrolls to top ─────────
    const handleLoadOlderMessages = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    // ── Prepend jitter compensation ───────────────────────────────────────────
    //
    // Problem: React appends older-page messages at index 0 of the array.
    // When new DOM nodes are prepended, the browser resets scrollTop toward 0,
    // causing the viewport to jump to the newly inserted content.
    //
    // Solution: before the commit we snapshot scrollHeight; after the commit
    // we shift scrollTop by the delta. The visible content appears stationary.
    //
    // We track "did a prepend happen" by watching whether the first message ID
    // changed AND the total count grew.
    const prevScrollHeightRef = useRef<number>(0);
    const prevFirstMessageIdRef = useRef<number | undefined>(messages[0]?.id);
    const prevMessageCountRef = useRef<number>(messages.length);

    // Capture scrollHeight synchronously on every render, before React commits.
    // This runs during the render phase, which is intentional — we need the
    // pre-commit value so the effect below can compute the delta.
    if (scrollContainerRef.current) {
        prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
    }

    // After commit: if a prepend happened, compensate scrollTop.
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const didPrepend =
            messages.length > prevMessageCountRef.current &&
            messages[0]?.id !== prevFirstMessageIdRef.current;

        if (didPrepend) {
            const delta = container.scrollHeight - prevScrollHeightRef.current;
            container.scrollTop += delta;
        }

        prevMessageCountRef.current = messages.length;
        prevFirstMessageIdRef.current = messages[0]?.id;
    });

    // ── Intersection-observer-based scroll tracker (FR2, FR5) ─────────────────
    useScrollTracker({
        chatId: chat?.id ?? 0,
        scrollContainerRef: scrollContainerRef as React.RefObject<HTMLElement>,
        messageIds,
    });

    // ── Scroll restoration on chat open (FR1, FR3, FR6, FR7) ─────────────────
    useScrollRestoration({
        chatId: chat?.id ?? 0,
        scrollContainerRef: scrollContainerRef as React.RefObject<HTMLElement>,
        messageIds,
        // When the stored anchor is not in the DOM we could trigger a fetch here.
        // For now we leave it as a no-op and fall back to bottom (FR6).
        // To enable FR7 deep-link restoration, pass a handler that calls
        // fetchPageContaining(messageId) via your chatService.
        onAnchorNotFound: undefined,
    });

    // ── Top sentinel for infinite scroll ─────────────────────────────────────
    const topSentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = topSentinelRef.current;
        const container = scrollContainerRef.current;
        if (!sentinel || !container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) handleLoadOlderMessages();
            },
            {root: container, threshold: 0}
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [handleLoadOlderMessages]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <List
            ref={scrollContainerRef as React.RefObject<HTMLUListElement>}
            sx={{
                flex: 1,
                p: 2,
                width: '100%',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
            }}
        >
            {/* Top sentinel — triggers older-message fetch on scroll-to-top */}
            <div ref={topSentinelRef} style={{height: 1}} aria-hidden="true"/>

            {isFetchingNextPage && <Loader/>}

            {messages.map((message) => (
                <ListItem
                    key={message.id}
                    data-message-id={message.id}
                    sx={{
                        py: 1,
                        width: '100%',
                        display: 'block',
                    }}
                >
                    <ListItemText
                        primary={`${message.authorUsername}: ${message.content}`}
                        secondary={formatMessageTimestamp(message.timestamp.toString())}
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                            '& .MuiListItemText-primary': {
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                            },
                        }}
                    />
                </ListItem>
            ))}
        </List>
    );
});