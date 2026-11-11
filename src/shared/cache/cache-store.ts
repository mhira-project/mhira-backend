import { Logger } from '@nestjs/common';
import KeyvRedis, { defaultReconnectStrategy } from '@keyv/redis';
import { Keyv } from 'keyv';
import { Connection } from 'mongoose';
import { redisConfig } from 'src/config/redis.config';
import { MongoCacheStore } from './stores/mongo-cache.store';

/** Injection token of the configured {@link CacheStoreHandle}. */
export const CACHE_STORE = Symbol('CACHE_STORE');

/** The cache's Keyv, what a missing key read as on the same store on v1.1.6, and what a failed call rejects with. */
export interface CacheStoreHandle {
    keyv: Keyv;
    missingValue: null | undefined;
    explainFailure: (error: unknown) => unknown;
}

/** The message a request that needs Redis fails with while Redis cannot be reached (Ronan, 2026-11-11). */
export const REDIS_UNREACHABLE_MESSAGE =
    'Redis is not reachable, and this request needs it. Please try again later.';

/** How long the first call waits for a connection before it fails. */
const REDIS_CONNECTION_TIMEOUT_MS = 2 * 1000;

const unchanged = (error: unknown): unknown => error;

/** NestJS's CacheModule default TTL (5 s), which v1.1.6's Redis store and its fallback store applied to `set` without a TTL. */
const NEST_DEFAULT_TTL_MS = 5 * 1000;

/** cache-manager-mongodb 0.3's own default TTL (60,000 s); Nest's default never reached that store. */
const MONGO_STORE_DEFAULT_TTL_MS = 60 * 1000 * 1000;

/**
 * Redis as v1.1.6 used it through cache-manager-redis-store 2: the key
 * `<prefix><key>` (prefix `mhira:production:default:` by default) and the
 * value `JSON.stringify(value)`, with Redis expiring the key itself. Keyv
 * wraps values as `{ value, expires }`, so it serialises the value alone.
 *
 * While Redis cannot be reached, a call fails at once with
 * REDIS_UNREACHABLE_MESSAGE instead of waiting (no offline queue; the
 * first connection gives up after REDIS_CONNECTION_TIMEOUT_MS), and the
 * client keeps reconnecting, so calls succeed again as soon as Redis is
 * back, in the same process. v1.1.6 ended the process instead (an `error`
 * event nobody listened to) and crash-looped; this difference is
 * registered (Ronan, 2026-11-11). An error Redis itself answers (such as
 * WRONGTYPE) is passed on as it is.
 */
function redisStore(): CacheStoreHandle {
    const { host, port, db, password, prefix } = redisConfig.default;
    const store = new KeyvRedis(
        {
            socket: { host, port, reconnectStrategy: defaultReconnectStrategy },
            database: db,
            password,
            disableOfflineQueue: true,
        },
        {
            keyPrefixSeparator: ':',
            throwOnErrors: true,
            connectionTimeout: REDIS_CONNECTION_TIMEOUT_MS,
        },
    );
    const keyv = new Keyv({
        store,
        namespace: prefix.replace(/:$/, ''),
        useKeyPrefix: false,
        ttl: NEST_DEFAULT_TTL_MS,
        serialize: ({ value }) => JSON.stringify(value),
        deserialize: (raw: string) => ({ value: JSON.parse(raw) }),
        throwOnErrors: true,
    });
    const client = store.client as { isReady: boolean };
    return {
        keyv,
        missingValue: null,
        explainFailure: error =>
            client.isReady ? error : new Error(REDIS_UNREACHABLE_MESSAGE),
    };
}

/** Keyv's own events drop an error nobody listens to; v1.1.6's Redis client made every connection error visible. */
function withLoggedErrors(
    handle: CacheStoreHandle,
    store: string,
): CacheStoreHandle {
    const logger = new Logger('CacheStore');
    handle.keyv.on('error', (error: unknown) =>
        logger.error(
            `${store}: ${
                error instanceof Error ? error.message : String(error)
            }`,
        ),
    );
    return handle;
}

/**
 * The cache store `CACHE_STORE` names, configured so that it stores what
 * v1.1.6 stored, with the same keys, values and TTLs, and so that a store
 * error rejects as it did on v1.1.6 (ticket 07 step 17).
 */
export function createCacheStore(
    store: string,
    connection: Connection,
): CacheStoreHandle {
    return withLoggedErrors(storeFor(store, connection), store);
}

function storeFor(store: string, connection: Connection): CacheStoreHandle {
    switch (store) {
        case 'redis':
            return redisStore();
        case 'mongo':
            return {
                keyv: new Keyv({
                    store: new MongoCacheStore(connection),
                    namespace: undefined,
                    useKeyPrefix: false,
                    ttl: MONGO_STORE_DEFAULT_TTL_MS,
                    serialize: undefined,
                    deserialize: undefined,
                    throwOnErrors: true,
                }),
                missingValue: undefined,
                explainFailure: unchanged,
            };
        case 'memory':
            // v1.1.6 configured it with `ttl: null`, so no default expiry
            // (its LRU limit of 500 entries is not reproduced).
            return {
                keyv: new Keyv({ throwOnErrors: true }),
                missingValue: undefined,
                explainFailure: unchanged,
            };
        default:
            // v1.1.6 registered the cache with the options of no store, and
            // NestJS fell back to an in-memory store with its defaults (5 s;
            // the LRU limit of 100 entries is not reproduced).
            return {
                keyv: new Keyv({
                    ttl: NEST_DEFAULT_TTL_MS,
                    throwOnErrors: true,
                }),
                missingValue: undefined,
                explainFailure: unchanged,
            };
    }
}
