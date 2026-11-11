import './bluebird-global';

export type CacheStore = 'memory' | 'redis' | 'mongo';

const CACHE_STORES: readonly CacheStore[] = ['memory', 'redis', 'mongo'];

function cacheStoreFromEnv(value: string): CacheStore {
    const store = CACHE_STORES.find(name => name === value);
    if (store === undefined) {
        throw new Error(
            `CACHE_STORE is "${value}"; it must be one of ${CACHE_STORES.join(
                ', ',
            )}.`,
        );
    }
    return store;
}

/**
 * Cache config
 */
export const cacheConfig = {
    /**
     * The Cache store to be used.
     *
     * valid options:
     *  - 'memory'
     *          for local development, stores data in-memory.
     *          Note: Cache is cleared on app restart.
     *  - 'redis' - for staging/production environments using redis store.
     *  - 'mongo' - for staging/production environments using mongodb store.
     *
     * default = 'mongo'
     */
    defaultStore: cacheStoreFromEnv(process.env.CACHE_STORE || 'mongo'),
};
