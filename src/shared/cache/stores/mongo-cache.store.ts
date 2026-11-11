import { EventEmitter } from 'events';
import { KeyvStoreAdapter, StoredData } from 'keyv';
import { Connection, mongo } from 'mongoose';

/** The collection v1.1.6's Mongo cache store (cache-manager-mongodb 0.3) was configured with. */
export const MONGO_CACHE_COLLECTION = 'cacheManager';

/** cache-manager-mongodb 0.3's own default TTL (60,000 s), for a `set` without a TTL or with 0; Nest's default never reached that store. */
const DEFAULT_TTL_MS = 60 * 1000 * 1000;

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
 * before Mongo's TTL monitor removes it. On first use it makes sure of
 * v1.1.6's two indexes, the TTL index on `expire` and the unique index on
 * `key`, which creates the collection if it does not exist yet; v1.1.6
 * made them only when it created the collection itself. Sessions and
 * failed-login counters written by either version are read by the other
 * (decision C, ticket 07 step 17).
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

    /** `ttl` in milliseconds; Keyv passes none when the caller gave none or 0, and v1.1.6 applied its default to both. */
    async set(
        key: string,
        entry: UnserialisedEntry,
        ttl?: number,
    ): Promise<void> {
        const collection = await this.getCollection();
        const expire = new Date(Date.now() + (ttl ?? DEFAULT_TTL_MS));
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

    /**
     * Creating an index that exists already changes nothing, so this is
     * safe however many instances start at once. A collection whose
     * contents keep an index from being made (duplicate keys) stays usable,
     * as on v1.1.6, and the failure is emitted to be logged.
     */
    private async openCollection(): Promise<mongo.Collection<CacheDocument>> {
        const collection = this.connection.db.collection<CacheDocument>(
            MONGO_CACHE_COLLECTION,
        );
        try {
            await collection.createIndex(
                { expire: 1 },
                { expireAfterSeconds: 0 },
            );
            await collection.createIndex({ key: 1 }, { unique: true });
        } catch (error) {
            if (!(error instanceof mongo.MongoServerError)) {
                throw error;
            }
            this.emit('error', error);
        }
        return collection;
    }
}
