import { Global, Module } from '@nestjs/common';
import { CacheModule as NestJSCacheModule } from '@nestjs/cache-manager';
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
