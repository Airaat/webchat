import {type RefObject, useEffect} from 'react';

interface UseInfiniteScrollOptions {
    sentinelRef: RefObject<HTMLElement | null>;
    hasMore: boolean | undefined;
    isLoading: boolean;
    onLoadMore: () => void;
    rootMargin?: string;
    threshold?: number;
}

export const useInfiniteScroll = ({
                                      sentinelRef,
                                      hasMore,
                                      isLoading,
                                      onLoadMore,
                                      rootMargin = '0px',
                                      threshold = 0.1,
                                  }: UseInfiniteScrollOptions) => {
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting && !isLoading) {
                    onLoadMore();
                }
            },
            {
                root: null,
                rootMargin,
                threshold,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [sentinelRef, hasMore, isLoading, onLoadMore, rootMargin, threshold]);
};