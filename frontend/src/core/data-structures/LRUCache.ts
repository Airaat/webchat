/**
 * A Least Recently Used (LRU) cache implementation.
 *
 * Items are evicted when the cache reaches capacity, with the least recently
 * accessed item being removed first. Both get and put operations update an
 * item's recency.
 *
 * @template T The type of values stored in the cache
 */
export class LRUCache<T> {
    readonly capacity: number;
    private cache: Map<string, T>;

    constructor(capacity: number = 20) {
        if (capacity <= 0) {
            throw new Error('Capacity must be a positive integer');
        }

        this.cache = new Map();
        this.capacity = capacity;
    }

    get size(): number {
        return this.cache.size;
    }

    get(key: string): T | undefined {
        if (!this.cache.has(key)) {
            return undefined;
        }

        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);

        return value;
    }

    put(key: string, value: T): string | undefined {
        let evictedKey: string | undefined;

        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size === this.capacity) {
            const lastKey = this.cache.keys().next().value as string;
            this.cache.delete(lastKey);
            evictedKey = lastKey;
        }

        this.cache.set(key, value);
        return evictedKey;
    }

    delete(key: string): boolean | undefined {
        return this.cache.delete(key);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    keys(): string[] {
        return Array.from(this.cache.keys());
    }

    values(): T[] {
        return Array.from(this.cache.values());
    }

    clear(): void {
        this.cache.clear();
    }
}