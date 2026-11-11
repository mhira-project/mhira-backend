import './bluebird-global';

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
     * default = 'mongo'. Any other value gives an in-memory cache with a
     * default TTL of 5 s, as on v1.1.6 (createCacheStore).
     */
    defaultStore: process.env.CACHE_STORE || 'mongo',
};
