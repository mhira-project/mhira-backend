import { Connection } from 'mongoose';
import { createCacheStore } from './cache-store';
import { CacheService } from './providers/cache.service';

// Ticket 07, step 17 and its review: the in-memory caches as v1.1.6 had
// them (cache-manager 3.4.4's memory store, measured in the 1.1.6 image by
// the review). `memory` was configured with `ttl: null`, so nothing expires
// by default; a CACHE_STORE that names no store made NestJS fall back to
// its own defaults, a 5 s TTL.

const UNUSED_CONNECTION = (undefined as unknown) as Connection;

describe('the in-memory cache stores', () => {
    beforeEach(() => jest.useFakeTimers({ now: Date.UTC(2026, 10, 11) }));
    afterEach(() => jest.useRealTimers());

    async function afterSixSeconds(store: string): Promise<unknown> {
        const cache = new CacheService(
            await createCacheStore(store, UNUSED_CONNECTION),
        );
        await cache.set('login-attempts:1', '{"attempts":1}');
        jest.advanceTimersByTime(6 * 1000);
        return cache.get('login-attempts:1');
    }

    it("'memory' keeps a value set without a TTL", async () => {
        expect(await afterSixSeconds('memory')).toBe('{"attempts":1}');
    });

    it('a store name that is none of the three gives a cache whose default TTL is 5 s', async () => {
        expect(await afterSixSeconds('Redis ')).toBeUndefined();
    });

    it('a TTL given in seconds still applies on both', async () => {
        for (const store of ['memory', 'unknown']) {
            const cache = new CacheService(
                await createCacheStore(store, UNUSED_CONNECTION),
            );
            await cache.set('active-sessions:a', 1, 1800);
            jest.advanceTimersByTime(1799 * 1000);
            expect(await cache.get('active-sessions:a')).toBe(1);
            jest.advanceTimersByTime(2 * 1000);
            expect(await cache.get('active-sessions:a')).toBeUndefined();
        }
    });
});
