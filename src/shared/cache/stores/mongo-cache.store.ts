import { EventEmitter } from 'events';
import { KeyvStoreAdapter, StoredData } from 'keyv';
import { Connection, mongo } from 'mongoose';

/** The collection v1.1.6's Mongo cache store (cache-manager-mongodb 0.3) was configured with. */
export const MONGO_CACHE_COLLECTION = 'cacheManager';

/** A cache entry as v1.1.6 stored it: the raw value, not serialised. */
interface CacheDocument {
    key: string;
    value: unknown;
    expire: Date;
}

/**
 * Keyv's form of a value it hands a store when it runs without
 * serialisation (`serialize: undefined`).
 */
interface UnserialisedEntry {
    value: unknown;
}

/**
 * A Keyv store that reads and writes the `cacheManager` collection exactly
 * as v1.1.6's cache-manager-mongodb 0.3 did, on the application's Mongoose
 * connection: one document `{ key, value, expire }` per key, written with
 * an upsert on `key`; a read ignores a document whose `expire` has passed
 * before Mongo's TTL monitor removes it; the collection, when it does not
 * exist yet, is created on first use with the TTL index on `expire` and the
 * unique index on `key`. Sessions and failed-login counters written by
 * either version are read by the other (decision C, ticket 07 step 17).
 */
export class MongoCacheStore extends EventEmitter implements KeyvStoreAdapter {
    readonly opts = { collection: MONGO_CACHE_COLLECTION };

    namespace?: string;

    private collection?: Promise<mongo.Collection<CacheDocument>>;

    constructor(private readonly connection: Connection) {
        super();
    }

    async get<Value>(key: string): Promise<StoredData<Value> | undefined> {
        const collection = await this.getCollection();
        const document = await collection.findOne({ key });
        if (!document || document.expire < new Date()) {
            return undefined;
        }
        return { value: document.value as Value };
    }

    /** `ttl` in milliseconds; Keyv always passes one, its configured default if the caller gave none. */
    async set(
        key: string,
        entry: UnserialisedEntry,
        ttl: number,
    ): Promise<void> {
        const collection = await this.getCollection();
        const expire = new Date(Date.now() + ttl);
        await collection.updateOne(
            { key },
            { $set: { key, value: entry.value, expire } },
            { upsert: true },
        );
    }

    async delete(key: string): Promise<boolean> {
        const collection = await this.getCollection();
        const { deletedCount } = await collection.deleteOne({ key });
        return deletedCount > 0;
    }

    async clear(): Promise<void> {
        const collection = await this.getCollection();
        await collection.deleteMany({});
    }

    private getCollection(): Promise<mongo.Collection<CacheDocument>> {
        if (this.collection === undefined) {
            this.collection = this.openCollection().catch(error => {
                this.collection = undefined;
                throw error;
            });
        }
        return this.collection;
    }

    private async openCollection(): Promise<mongo.Collection<CacheDocument>> {
        const db = this.connection.db;
        const existing = await db
            .listCollections(
                { name: MONGO_CACHE_COLLECTION },
                { nameOnly: true },
            )
            .toArray();
        if (existing.length > 0) {
            return db.collection<CacheDocument>(MONGO_CACHE_COLLECTION);
        }
        const collection = await db.createCollection<CacheDocument>(
            MONGO_CACHE_COLLECTION,
        );
        await collection.createIndex({ expire: 1 }, { expireAfterSeconds: 0 });
        await collection.createIndex({ key: 1 }, { unique: true });
        return collection;
    }
}
