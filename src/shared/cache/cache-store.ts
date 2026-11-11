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

/** How long the start waits for the first connection to Redis before it goes on without one. */
const REDIS_CONNECTION_TIMEOUT_MS = 2 * 1000;

/** NestJS's CacheModule default TTL (5 s), which v1.1.6's Redis store and its fallback store applied to `set` without a TTL. */
const NEST_DEFAULT_TTL_MS = 5 * 1000;

type ErrorLogger = (error: unknown) => void;

/** What this module uses of @redis/client's client, whose own generic types TypeScript 4.9 cannot resolve. */
interface RedisConnection {
    readonly isReady: boolean;
    connect(): Promise<unknown>;
    on(event: 'error', listener: ErrorLogger): unknown;
}

/** A store whose failures reach the caller as the store raised them. */
function passingFailuresOn(
    keyv: Keyv,
    missingValue: null | undefined,
): CacheStoreHandle {
    return { keyv, missingValue, explainFailure: error => error };
}

/**
 * Waits until the client is connected, or REDIS_CONNECTION_TIMEOUT_MS,
 * whichever comes first. The client keeps trying in the background
 * either way.
 */
async function firstConnection(
    client: RedisConnection,
    logError: ErrorLogger,
): Promise<void> {
    let timer: NodeJS.Timeout;
    const timeout = new Promise<void>(resolve => {
        timer = setTimeout(resolve, REDIS_CONNECTION_TIMEOUT_MS);
    });
    const connected = client.connect().then(() => undefined, logError);
    await Promise.race([connected, timeout]);
    clearTimeout(timer);
}

/**
 * Redis as v1.1.6 used it through cache-manager-redis-store 2: the key
 * `<prefix><key>` (prefix `mhira:production:default:` by default) and the
 * value `JSON.stringify(value)`, with Redis expiring the key itself. Keyv
 * wraps values as `{ value, expires }`, so it serialises the value alone.
 *
 * The client connects when the application starts, as v1.1.6's did, and
 * the start waits for that connection for at most
 * REDIS_CONNECTION_TIMEOUT_MS. While Redis cannot be reached, a call fails
 * at once with REDIS_UNREACHABLE_MESSAGE instead of waiting (no offline
 * queue), and the client keeps reconnecting, so calls succeed again as
 * soon as Redis is back, in the same process. v1.1.6 ended the process
 * instead (an `error` event nobody listened to) and crash-looped; this
 * difference is registered (Ronan, 2026-11-11). An error Redis itself
 * answers (such as WRONGTYPE) is passed on as it is.
 */
async function redisStore(logError: ErrorLogger): Promise<CacheStoreHandle> {
    const { host, port, db, password, prefix } = redisConfig.default;
    const store = new KeyvRedis(
        {
            socket: { host, port, reconnectStrategy: defaultReconnectStrategy },
            database: db,
            password,
            disableOfflineQueue: true,
        },
        { keyPrefixSeparator: ':', throwOnErrors: true },
    );
    const client = (store.client as unknown) as RedisConnection;
    // Each connection error, including every failed reconnect attempt, as
    // v1.1.6's client made them visible.
    client.on('error', logError);
    const keyv = new Keyv({
        store,
        namespace: prefix.replace(/:$/, ''),
        useKeyPrefix: false,
        ttl: NEST_DEFAULT_TTL_MS,
        serialize: ({ value }) => JSON.stringify(value),
        deserialize: (raw: string) => ({ value: JSON.parse(raw) }),
        throwOnErrors: true,
    });
    await firstConnection(client, logError);
    return {
        keyv,
        missingValue: null,
        explainFailure: error =>
            client.isReady ? error : new Error(REDIS_UNREACHABLE_MESSAGE),
    };
}

/**
 * The cache store `CACHE_STORE` names, configured so that it stores what
 * v1.1.6 stored, with the same keys, values and TTLs, and so that a store
 * error rejects as it did on v1.1.6 (ticket 07 step 17). Every failed call
 * is logged once.
 */
export async function createCacheStore(
    store: string,
    connection: Connection,
): Promise<CacheStoreHandle> {
    const logger = new Logger('CacheStore');
    const logError: ErrorLogger = error =>
        logger.error(
            `${store}: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    const handle = await storeFor(store, connection, logError);
    return {
        ...handle,
        explainFailure: error => {
            logError(error);
            return handle.explainFailure(error);
        },
    };
}

async function storeFor(
    store: string,
    connection: Connection,
    logError: ErrorLogger,
): Promise<CacheStoreHandle> {
    switch (store) {
        case 'redis':
            return redisStore(logError);
        case 'mongo': {
            const mongoStore = new MongoCacheStore(connection);
            mongoStore.on('error', logError);
            return passingFailuresOn(
                new Keyv({
                    store: mongoStore,
                    namespace: undefined,
                    useKeyPrefix: false,
                    serialize: undefined,
                    deserialize: undefined,
                    throwOnErrors: true,
                }),
                undefined,
            );
        }
        case 'memory':
            // v1.1.6 configured it with `ttl: null`, so no default expiry
            // (its LRU limit of 500 entries is not reproduced).
            return passingFailuresOn(
                new Keyv({ throwOnErrors: true }),
                undefined,
            );
        default:
            // v1.1.6 registered the cache with the options of no store, and
            // NestJS fell back to an in-memory store with its defaults (5 s;
            // the LRU limit of 100 entries is not reproduced).
            return passingFailuresOn(
                new Keyv({ ttl: NEST_DEFAULT_TTL_MS, throwOnErrors: true }),
                undefined,
            );
    }
}
