import KeyvRedis, { createClient } from '@keyv/redis';
import { createCacheStore } from 'src/shared/cache/cache-store';
import { CacheService } from 'src/shared/cache/providers/cache.service';
import { Connection } from 'mongoose';

// Ticket 07, step 17: the Redis cache stores what v1.1.6 stored through
// cache-manager-redis-store 2 (`SETEX <prefix><key> <ttl> JSON.stringify(value)`),
// so sessions and failed-login counters survive the upgrade and a
// rollback. Needs REDIS_HOST and REDIS_PORT of a Redis to write to; run it
// against every Redis major an installation may have (follow-up item 10).

const PREFIX = 'mhira:production:default:';
const UNUSED_CONNECTION = (undefined as unknown) as Connection;

describe('the Redis cache store', () => {
    const redis = createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },
    });
    const store = createCacheStore('redis', UNUSED_CONNECTION);
    const cache = new CacheService(store);

    beforeAll(() => redis.connect());
    afterAll(() => Promise.all([redis.quit(), store.keyv.disconnect()]));
    beforeEach(() => redis.flushDb());

    it('stores a session as v1.1.6 did: key, JSON value, the TTL given in seconds', async () => {
        await cache.set('active-sessions:a-jti', 1, 1800);
        expect(await redis.get(`${PREFIX}active-sessions:a-jti`)).toBe('1');
        const ttl = await redis.pTTL(`${PREFIX}active-sessions:a-jti`);
        expect(ttl).toBeGreaterThan(1795 * 1000);
        expect(ttl).toBeLessThanOrEqual(1800 * 1000);
    });

    it("stores a value without a TTL for Nest's default 5 s, JSON-encoded", async () => {
        const counter = JSON.stringify({ attempts: 1, lastAttemptAt: 'x' });
        await cache.set('login-attempts:7', counter);
        expect(await redis.get(`${PREFIX}login-attempts:7`)).toBe(
            JSON.stringify(counter),
        );
        const ttl = await redis.pTTL(`${PREFIX}login-attempts:7`);
        expect(ttl).toBeGreaterThan(4 * 1000);
        expect(ttl).toBeLessThanOrEqual(5 * 1000);
    });

    it('reads what v1.1.6 wrote', async () => {
        await redis.setEx(`${PREFIX}active-sessions:old-jti`, 1800, '1');
        await redis.setEx(
            `${PREFIX}login-attempts:8`,
            5,
            JSON.stringify('{"attempts":2}'),
        );
        expect(await cache.get('active-sessions:old-jti')).toBe(1);
        expect(await cache.get('login-attempts:8')).toBe('{"attempts":2}');
    });

    it("reads a missing key as v1.1.6's Redis store did, null", async () => {
        expect(await cache.get('login-attempts:9')).toBeNull();
    });

    it('deletes', async () => {
        await cache.set('active-sessions:gone', 1, 1800);
        await cache.del('active-sessions:gone');
        expect(await redis.exists(`${PREFIX}active-sessions:gone`)).toBe(0);
    });

    it('rejects on a store error, as v1.1.6 did, instead of reading it as missing', async () => {
        await redis.hSet(`${PREFIX}active-sessions:a-hash`, 'field', '1');
        await expect(cache.get('active-sessions:a-hash')).rejects.toThrow(
            /WRONGTYPE/,
        );
    });

    it('logs the errors of a Redis it cannot reach, which Keyv alone would drop', async () => {
        const port = process.env.REDIS_PORT;
        process.env.REDIS_PORT = '1';
        let unreachable: ReturnType<typeof createCacheStore>;
        let logged: jest.SpyInstance;
        jest.isolateModules(() => {
            const isolatedNest: typeof import('@nestjs/common') = require('@nestjs/common');
            logged = jest
                .spyOn(isolatedNest.Logger.prototype, 'error')
                .mockImplementation(() => undefined);
            const isolated: typeof import('src/shared/cache/cache-store') = require('src/shared/cache/cache-store');
            unreachable = isolated.createCacheStore('redis', UNUSED_CONNECTION);
        });
        process.env.REDIS_PORT = port;
        unreachable.keyv.get('active-sessions:a-jti').catch(() => undefined);
        for (let i = 0; i < 30 && logged.mock.calls.length === 0; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        expect(logged).toHaveBeenCalledWith(
            expect.stringMatching(/^redis: .*ECONNREFUSED/),
        );
        await (unreachable.keyv.store as KeyvRedis<unknown>).client.destroy();
    });
});
