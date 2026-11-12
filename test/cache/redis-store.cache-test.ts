import { createClient } from '@keyv/redis';
import { createCacheStore } from 'src/shared/cache/cache-store';
import { CacheService } from 'src/shared/cache/providers/cache.service';
import { Connection } from 'mongoose';
import { REDIS_URL } from '../services';

// The Redis cache stores what v1.1.6 stored through cache-manager-redis-store 2
// (`SETEX <prefix><key> <ttl> JSON.stringify(value)`), so sessions and
// failed-login counters survive an upgrade from 1.1.6 and a way back. The
// test flushes the Redis it is given.

const PREFIX = 'mhira:production:default:';
const UNUSED_CONNECTION = (undefined as unknown) as Connection;

describe('the Redis cache store', () => {
    const redis = createClient({ url: REDIS_URL });
    let cache: CacheService;

    beforeAll(async () => {
        await redis.connect();
        cache = new CacheService(
            await createCacheStore('redis', UNUSED_CONNECTION),
        );
    });
    afterAll(() => Promise.all([redis.quit(), cache.onModuleDestroy()]));
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

    it('answers calls made all at once right after the start', async () => {
        const fresh = new CacheService(
            await createCacheStore('redis', UNUSED_CONNECTION),
        );
        await Promise.all(
            ['a', 'b', 'c'].map(id =>
                fresh.set(`active-sessions:${id}`, 1, 60),
            ),
        );
        expect(await fresh.get('active-sessions:c')).toBe(1);
        await fresh.onModuleDestroy();
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

    it('fails each call at once with a clear message, and logs each failure once, when Redis cannot be reached', async () => {
        const port = process.env.REDIS_PORT;
        process.env.REDIS_PORT = '1';
        let createUnreachable: () => Promise<CacheService>;
        let message: string;
        let logged: jest.SpyInstance;
        jest.isolateModules(() => {
            const isolatedNest: typeof import('@nestjs/common') = require('@nestjs/common');
            logged = jest
                .spyOn(isolatedNest.Logger.prototype, 'error')
                .mockImplementation(() => undefined);
            const isolated: typeof import('src/shared/cache/cache-store') = require('src/shared/cache/cache-store');
            const isolatedService: typeof import('src/shared/cache/providers/cache.service') = require('src/shared/cache/providers/cache.service');
            message = isolated.REDIS_UNREACHABLE_MESSAGE;
            createUnreachable = async () =>
                new isolatedService.CacheService(
                    await isolated.createCacheStore('redis', UNUSED_CONNECTION),
                );
        });
        const startedAt = Date.now();
        const unreachable = await createUnreachable();
        process.env.REDIS_PORT = port;
        expect(Date.now() - startedAt).toBeLessThan(3000);
        expect(logged).toHaveBeenCalledWith(
            expect.stringMatching(/^redis: .*ECONNREFUSED/),
        );
        for (const call of [1, 2]) {
            logged.mockClear();
            const started = Date.now();
            await expect(
                unreachable.get(`active-sessions:${call}`),
            ).rejects.toThrow(message);
            expect(Date.now() - started).toBeLessThan(100);
            expect(
                logged.mock.calls.filter(([line]) =>
                    /The client is offline/.test(line),
                ),
            ).toHaveLength(1);
        }
        await unreachable.onModuleDestroy();
    });
});
