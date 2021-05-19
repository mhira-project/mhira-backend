import { CacheModuleOptions } from "@nestjs/common";
import { redisConfig } from "./redis.config";
import * as redisStore from 'cache-manager-redis-store';
import * as mongoStore from 'cache-manager-mongodb';
import { configService } from "./config.service";

export type CacheStore = 'memory' | 'redis' | 'mongo';


/**
 * Cache config
 */
export const cacheConfig = {

    /**
     * The Cache store to be used.
     * 
     * valid options:
     *  - 'memory'
     *          for local development, stores data in-memory array. 
     *          Note: Cache is cleared on app restart.
     *  - 'redis' - for staging/production environments using redis store.
     *  - 'mongo' - for staging/production environments using mongodb store.
     * 
     * default = 'mongo'
     * 
     */
    defaultStore: process.env.CACHE_STORE || 'mongo' as CacheStore,

    stores: {

        memory: {
            ttl: null, // seconds;  null to use default
            max: null, // maximum number of items in cache; null to use default
        },

        redis: {
            store: redisStore,
            ...redisConfig.default,
        },

        mongo: {
            store: mongoStore,
            uri: configService.getMongoConnectionString(),
            options: {
                collection: 'cacheManager',
                compression: false,
                poolSize: 5,
                autoReconnect: true
            }
        }

    } as { [key in CacheStore]: CacheModuleOptions }

};
