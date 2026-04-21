import {useEffect, useRef} from 'react';
import {useChatUIStore} from '../store/chatUIStore';

/**
 * useScrollRestoration
 *
 * Restores scroll position when a chat is opened.
 *
 * First visit (no stored anchor)  → scroll to bottom.
 * Return visit (stored anchor)    → scrollIntoView the anchored message.
 * Anchor not yet in DOM           → fall back to bottom, watch for node via
 *                                   MutationObserver, restore when it arrives.
 *
 * Chat-switch handling
 * ─────────────────────
 * MessageList is NOT remounted on chat switch (no key prop); it reuses the
 * same component instance. We therefore track which chatId we last restored
 * so we don't re-trigger restoration when messageIds updates due to infinite
 * scroll prepend within the same chat.
 *
 * Prepend jitter compensation
 * ────────────────────────────
 * When older pages are prepended the browser snaps scrollTop to 0, causing
 * the viewport to jump. MessageList.tsx compensates by measuring the
 * scrollHeight delta and adjusting scrollTop after commit. This hook does
 * not need to handle that; it only fires once on the first render of a chat.
 */


interface UseScrollRestorationOptions {
    chatId: number;
    scrollContainerRef: React.RefObject<HTMLElement>;
    /** All message IDs currently rendered (index 0 = oldest). */
    messageIds: number[];
    /**
     * Optional: called when the stored anchor messageId is not present in the
     * current DOM. The caller can use this to trigger a fetch for the relevant
     * page.
     */
    onAnchorNotFound?: (messageId: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scrollToBottom(container: HTMLElement): void {
    // Direct assignment — instant, no animation flash on mount.
    container.scrollTop = container.scrollHeight - container.clientHeight;
}

function scrollToMessage(container: HTMLElement, messageId: number): boolean {
    const el = container.querySelector<HTMLElement>(
        `[data-message-id="${messageId}"]`
    );
    if (!el) return false;

    // block:'start' → message appears at top of viewport.
    // behavior:'instant' → no visible scroll animation on mount.
    el.scrollIntoView({block: 'start', behavior: 'instant'});
    return true;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useScrollRestoration({
                                         chatId,
                                         scrollContainerRef,
                                         messageIds,
                                         onAnchorNotFound,
                                     }: UseScrollRestorationOptions): void {
    const getScrollAnchor = useChatUIStore((s) => s.getScrollAnchor);

    // Which chatId we have already successfully restored.
    // undefined = nothing restored yet.
    const restoredForChat = useRef<number | undefined>(undefined);

    // Active MutationObserver watching for a deferred anchor node.
    const mutationObserverRef = useRef<MutationObserver | null>(null);

    // ── Reset on chat switch ──────────────────────────────────────────────────
    useEffect(() => {
        // When chatId changes, clear restoration state so the new chat gets a
        // fresh pass regardless of whether the component was remounted.
        if (restoredForChat.current !== chatId) {
            restoredForChat.current = undefined;
            mutationObserverRef.current?.disconnect();
            mutationObserverRef.current = null;
        }
    }, [chatId]);

    // ── Restoration ───────────────────────────────────────────────────────────
    useEffect(() => {
        const container = scrollContainerRef.current;

        // Guard: container not yet mounted or message list empty.
        if (!container || messageIds.length === 0) return;

        // Guard: already restored for this chat — don't re-fire on prepend.
        if (restoredForChat.current === chatId) return;

        const anchorId = getScrollAnchor(chatId);

        // ── First visit: no stored anchor ─────────────────────────────────────
        if (anchorId === undefined) {
            scrollToBottom(container);
            restoredForChat.current = chatId;
            return;
        }

        // ── Return visit: try to scroll to the anchor immediately ─────────────
        const found = scrollToMessage(container, anchorId);
        if (found) {
            restoredForChat.current = chatId;
            return;
        }

        // ── Anchor not in DOM yet ─────────────────────────────────────────────
        // The message belongs to a page not yet loaded. Fall back to bottom
        // and notify the caller so it can fetch the right page.
        scrollToBottom(container);
        onAnchorNotFound?.(anchorId);

        // Watch for the anchor node to be inserted (e.g. after the page fetch).
        mutationObserverRef.current?.disconnect();

        const observer = new MutationObserver(() => {
            const found = scrollToMessage(container, anchorId);
            if (found) {
                restoredForChat.current = chatId;
                observer.disconnect();
                mutationObserverRef.current = null;
            }
        });

        observer.observe(container, {childList: true, subtree: true});
        mutationObserverRef.current = observer;

    }, [chatId, messageIds, scrollContainerRef, getScrollAnchor, onAnchorNotFound]);

    useEffect(() => {
        return () => mutationObserverRef.current?.disconnect();
    }, []);
}