import {useCallback, useEffect, useRef} from 'react';
import {useChatUIStore} from '../store/chatUIStore';

/**
 * useScrollTracker
 *
 * Continuously tracks which message is first-visible inside the scroll
 * container and writes its ID into chatUIStore.scrollAnchors.
 *
 * Design notes
 * ────────────
 * • Uses IntersectionObserver (root = scroll container) so we never read
 *   scrollTop or getBoundingClientRect() synchronously — zero layout thrash.
 * • rAF throttle: the scroll event schedules a single rAF per frame;
 *   redundant ticks within the same frame are dropped.
 * • On cleanup (chat switch / unmount) a final synchronous write is performed
 *   so FR2 is honoured even if the last rAF tick never fired.
 * • messageIds uses number[] to match Message.id from types/chat.ts.
 */


interface UseScrollTrackerOptions {
    chatId: number;
    scrollContainerRef: React.RefObject<HTMLElement>;
    /** Ordered array of message IDs currently rendered (index 0 = oldest). */
    messageIds: number[];
}

export function useScrollTracker({
                                     chatId,
                                     scrollContainerRef,
                                     messageIds,
                                 }: UseScrollTrackerOptions): void {
    const setScrollAnchor = useChatUIStore((s) => s.setScrollAnchor);

    // Latest IntersectionObserverEntry per messageId.
    const visibilityMap = useRef<Map<number, IntersectionObserverEntry>>(new Map());

    // rAF handle — null when no tick is pending.
    const rafHandle = useRef<number | null>(null);

    /**
     * Walk messageIds in order (oldest → newest) and return the first one
     * whose IntersectionObserver entry says isIntersecting.
     * This is the topmost visible message in the viewport.
     */
    const getFirstVisibleId = useCallback((): number | null => {
        for (const id of messageIds) {
            const entry = visibilityMap.current.get(id);
            if (entry?.isIntersecting) return id;
        }
        return null;
    }, [messageIds]);

    /** Write the current first-visible message to the store. */
    const flushPosition = useCallback(() => {
        rafHandle.current = null;
        const id = getFirstVisibleId();
        if (id !== null) {
            setScrollAnchor(chatId, id);
        }
    }, [chatId, getFirstVisibleId, setScrollAnchor]);

    /** Schedule one rAF flush, dropping any already-pending tick. */
    const scheduleFlush = useCallback(() => {
        if (rafHandle.current !== null) return;
        rafHandle.current = requestAnimationFrame(flushPosition);
    }, [flushPosition]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || messageIds.length === 0) return;

        // Collect DOM nodes for all currently rendered messages.
        const nodes = messageIds.flatMap((id) => {
            const el = container.querySelector<HTMLElement>(
                `[data-message-id="${id}"]`
            );
            return el ? [{id, el}] : [];
        });

        if (nodes.length === 0) return;

        // root: the scroll container so only messages inside the chat pane count.
        // threshold: 0 → fire as soon as any pixel is visible.
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const rawId = (entry.target as HTMLElement).dataset.messageId;
                    if (rawId !== undefined) {
                        visibilityMap.current.set(Number(rawId), entry);
                    }
                }
                scheduleFlush();
            },
            {root: container, threshold: 0}
        );

        for (const {el} of nodes) {
            observer.observe(el);
        }

        // Also listen for scroll events: handles the case where a very tall
        // message occupies the whole viewport and intersection state never changes.
        container.addEventListener('scroll', scheduleFlush, {passive: true});

        return () => {
            // perform a final synchronous write before teardown.
            if (rafHandle.current !== null) {
                cancelAnimationFrame(rafHandle.current);
                rafHandle.current = null;
            }
            const id = getFirstVisibleId();
            if (id !== null) setScrollAnchor(chatId, id);

            container.removeEventListener('scroll', scheduleFlush);
            observer.disconnect();
            visibilityMap.current.clear();
        };
    }, [chatId, messageIds, scrollContainerRef, scheduleFlush, getFirstVisibleId, setScrollAnchor]);
}