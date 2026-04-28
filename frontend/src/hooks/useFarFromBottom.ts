import {useEffect, useRef, useState, type RefObject} from 'react';

interface UseFarFromBottomOptions {
    scrollContainerRef: RefObject<HTMLElement>;
    /**
     * Recompute trigger — pass the message count (or any monotonically-changing
     * value) so the flag updates when new messages arrive while the user is
     * scrolled up: scrollHeight grows but no scroll event fires.
     */
    messageCount: number;
    threshold?: number;
}

const DEFAULT_THRESHOLD_PX = 300;

/**
 * Tracks whether the scroll container is further than `thresholdPx` from the
 * bottom. Used to toggle a floating "scroll to bottom" button.
 *
 * rAF-throttled scroll listener — at most one measurement per frame.
 */
export function useFarFromBottom({
                                     scrollContainerRef,
                                     messageCount,
                                     threshold,
                                 }: UseFarFromBottomOptions): boolean {
    const [isFar, setIsFar] = useState(false);
    const rafHandle = useRef<number | null>(null);
    const thresholdPx = threshold ?? DEFAULT_THRESHOLD_PX;

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const measure = () => {
            rafHandle.current = null;
            const distance =
                container.scrollHeight - container.scrollTop - container.clientHeight;
            setIsFar(distance > thresholdPx);
        };

        const schedule = () => {
            if (rafHandle.current !== null) return;
            rafHandle.current = requestAnimationFrame(measure);
        };

        // Initial read covers the case where messageCount changed (new tail
        // message appended while scrolled up) without a scroll event.
        measure();
        container.addEventListener('scroll', schedule, {passive: true});

        return () => {
            container.removeEventListener('scroll', schedule);
            if (rafHandle.current !== null) {
                cancelAnimationFrame(rafHandle.current);
                rafHandle.current = null;
            }
        };
    }, [scrollContainerRef, thresholdPx, messageCount]);

    return isFar;
}
