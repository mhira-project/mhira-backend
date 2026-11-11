import { Inject, Injectable } from '@nestjs/common';
import { CACHE_STORE, CacheStoreHandle } from '../cache-store';

@Injectable()
export class CacheService {
    constructor(
        @Inject(CACHE_STORE) private readonly store: CacheStoreHandle,
    ) {}

    /** The stored value; a missing key reads as it did on the same store on v1.1.6 (`null` on Redis, `undefined` elsewhere). */
    async get<T>(key: string): Promise<T | null | undefined> {
        const value = await this.call(() => this.store.keyv.get<T>(key));
        return value === undefined ? this.store.missingValue : value;
    }

    /** Stores the value for `ttlSeconds`, or for the store's default TTL. */
    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        await this.call(() =>
            this.store.keyv.set(
                key,
                value,
                ttlSeconds === undefined ? undefined : ttlSeconds * 1000,
            ),
        );
    }

    async del(key: string): Promise<void> {
        await this.call(() => this.store.keyv.delete(key));
    }

    private async call<R>(operation: () => Promise<R>): Promise<R> {
        try {
            return await operation();
        } catch (error) {
            throw this.store.explainFailure(error);
        }
    }
}
