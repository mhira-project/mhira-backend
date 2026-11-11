import { Global, Module } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { cacheConfig } from 'src/config/cache.config';
import { CACHE_STORE, createCacheStore } from './cache-store';
import { CacheService } from './providers/cache.service';

@Global() // Register as Global Module
@Module({
    providers: [
        {
            provide: CACHE_STORE,
            useFactory: (connection: Connection) =>
                createCacheStore(cacheConfig.defaultStore, connection),
            inject: [getConnectionToken()],
        },
        CacheService,
    ],
    exports: [CacheService],
})
export class CacheModule {}
