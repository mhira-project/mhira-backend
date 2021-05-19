import { CacheModule as NestJSCacheModule, Global, Module } from '@nestjs/common';
import { cacheConfig } from 'src/config/cache.config';
import { CacheService } from './providers/cache.service';

@Global() // Register as Global Module
@Module({
    imports: [
        NestJSCacheModule.register(
            cacheConfig.stores[cacheConfig.defaultStore]
        ),
    ],
    providers: [
        CacheService,
    ],
    exports: [CacheService]
})
export class CacheModule { }
