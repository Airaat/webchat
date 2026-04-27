import {useEffect, useRef} from 'react';
import type {Message} from '../types/chat';
import {scrollToBottom} from '../utils/scrollHelpers';

interface UseAutoScrollOnNewMessageOptions {
    chatId: number;
    messages: Message[];
    currentUserId: number | undefined;
    scrollContainerRef: React.RefObject<HTMLElement>;
}

// How close to the bottom the viewport must be (in px) for an incoming message
// from another author to trigger auto-scroll. Generous enough to absorb the
// height of the freshly-appended message — by the time this effect fires the
// new node is already in the DOM, so scrollHeight has grown by ~one message.
const NEAR_BOTTOM_THRESHOLD_PX = 150;

/**
 * Auto-scrolls to the bottom when a new tail message arrives:
 *  - Always for the current user's own messages (sender expects to see what
 *    they just sent).
 *  - For other authors, only when the user is already near the bottom — so we
 *    don't yank the viewport while they're reading older history.
 *
 * Quietly updates the baseline on chat switch (restoration owns that case)
 * and ignores prepend (older pages don't change the last message id).
 */
export function useAutoScrollOnNewMessage({
                                              chatId,
                                              messages,
                                              currentUserId,
                                              scrollContainerRef,
                                          }: UseAutoScrollOnNewMessageOptions): void {
    const baselineRef = useRef<{ chatId: number; lastId: number | null }>({
        chatId: 0,
        lastId: null,
    });

    useEffect(() => {
        const last = messages[messages.length - 1];
        const prev = baselineRef.current;

        // Chat switch — restoration handles positioning, just rebase.
        if (prev.chatId !== chatId) {
            baselineRef.current = {chatId, lastId: last?.id ?? null};
            return;
        }

        // No append at the tail (prepend or no change).
        if (!last || last.id === prev.lastId) return;

        baselineRef.current = {chatId, lastId: last.id};

        const container = scrollContainerRef.current;
        if (!container) return;

        if (last.authorId === currentUserId) {
            scrollToBottom(container);
            return;
        }

        const distanceFromBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX) {
            scrollToBottom(container);
        }
    }, [chatId, messages, currentUserId, scrollContainerRef]);
}
