import { createConnection, Connection, mongo } from 'mongoose';
import { createCacheStore } from 'src/shared/cache/cache-store';
import { CacheService } from 'src/shared/cache/providers/cache.service';
import { MONGO_CACHE_COLLECTION } from 'src/shared/cache/stores/mongo-cache.store';

// Ticket 07, step 17 (decision C): the Mongo cache store reads and writes
// the `cacheManager` collection as v1.1.6's cache-manager-mongodb 0.3 did.
// The documents and indexes expected here were measured on v1.1.6 with
// CACHE_STORE=mongo (follow-up item 9, .local/t07e/item9-cacheManager-1.1.6.txt).
// Needs MHIRA_TEST_MONGO_URL, a database it may drop.

describe('the Mongo cache store', () => {
    let connection: Connection;
    let cache: CacheService;

    function collection(): mongo.Collection {
        return connection.db.collection(MONGO_CACHE_COLLECTION);
    }

    beforeEach(async () => {
        connection = await createConnection(
            process.env.MHIRA_TEST_MONGO_URL,
        ).asPromise();
        await connection.db.dropDatabase();
        cache = new CacheService(await createCacheStore('mongo', connection));
    });

    afterEach(() => connection.close());

    it("creates the collection on first use with v1.1.6's indexes", async () => {
        await cache.get('active-sessions:none');
        expect(await collection().indexes()).toEqual([
            { v: 2, key: { _id: 1 }, name: '_id_' },
            {
                v: 2,
                key: { expire: 1 },
                name: 'expire_1',
                expireAfterSeconds: 0,
            },
            { v: 2, key: { key: 1 }, name: 'key_1', unique: true },
        ]);
    });

    it("gives an existing collection without them v1.1.6's indexes", async () => {
        await connection.db.createCollection(MONGO_CACHE_COLLECTION);
        await cache.get('active-sessions:none');
        expect(
            (await collection().indexes()).map(index => index.name),
        ).toEqual(['_id_', 'expire_1', 'key_1']);
    });

    it('stays usable, as on v1.1.6, when duplicate keys keep the unique index from being made', async () => {
        await collection().insertMany([
            { key: 'login-attempts:3', expire: new Date(0), value: 'a' },
            { key: 'login-attempts:3', expire: new Date(0), value: 'b' },
        ]);
        await cache.set('active-sessions:kept', 1, 1800);
        expect(await cache.get('active-sessions:kept')).toBe(1);
    });

    it('starts on a fresh database from several callers at once', async () => {
        const second = new CacheService(
            await createCacheStore('mongo', connection),
        );
        await Promise.all([
            cache.get('active-sessions:none'),
            second.get('active-sessions:none'),
        ]);
        expect(await collection().indexes()).toHaveLength(3);
    });

    it('stores a session as v1.1.6 did: the raw value as an int32, expiring after the TTL in seconds', async () => {
        const before = Date.now();
        await cache.set('active-sessions:a-jti', 1, 1800);
        const document = await collection().findOne(
            { key: 'active-sessions:a-jti' },
            { promoteValues: false },
        );
        expect(Object.keys(document)).toEqual([
            '_id',
            'key',
            'expire',
            'value',
        ]);
        expect(document.value).toBeInstanceOf(mongo.Int32);
        expect(document.value.valueOf()).toBe(1);
        const expire = (document.expire as Date).getTime();
        expect(expire).toBeGreaterThanOrEqual(before + 1800 * 1000);
        expect(expire).toBeLessThanOrEqual(Date.now() + 1800 * 1000);
    });

    it("stores a value without a TTL for the store's own default, 60,000 s, as a string", async () => {
        const before = Date.now();
        await cache.set('login-attempts:7', '{"attempts":1}');
        const document = await collection().findOne({
            key: 'login-attempts:7',
        });
        expect(document.value).toBe('{"attempts":1}');
        const expire = (document.expire as Date).getTime();
        expect(expire).toBeGreaterThanOrEqual(before + 60000 * 1000);
        expect(expire).toBeLessThanOrEqual(Date.now() + 60000 * 1000);
    });

    it("stores a value with a TTL of 0 for the store's default, as v1.1.6 did", async () => {
        const before = Date.now();
        await cache.set('active-sessions:zero', 1, 0);
        const document = await collection().findOne({
            key: 'active-sessions:zero',
        });
        expect((document.expire as Date).getTime()).toBeGreaterThanOrEqual(
            before + 60000 * 1000,
        );
        expect(await cache.get('active-sessions:zero')).toBe(1);
    });

    it('overwrites a key in place', async () => {
        await cache.set('login-attempts:7', 'one');
        await cache.set('login-attempts:7', 'two');
        expect(
            await collection().countDocuments({ key: 'login-attempts:7' }),
        ).toBe(1);
        expect(await cache.get('login-attempts:7')).toBe('two');
    });

    it('reads what v1.1.6 wrote, and nothing whose expire has passed', async () => {
        await cache.get('active-sessions:none');
        const inAnHour = new Date(Date.now() + 3600 * 1000);
        await collection().insertMany([
            { key: 'active-sessions:old-jti', expire: inAnHour, value: 1 },
            {
                key: 'login-attempts:8',
                expire: inAnHour,
                value: '{"attempts":2}',
            },
            {
                key: 'active-sessions:expired',
                expire: new Date(Date.now() - 1000),
                value: 1,
            },
        ]);
        expect(await cache.get('active-sessions:old-jti')).toBe(1);
        expect(await cache.get('login-attempts:8')).toBe('{"attempts":2}');
        expect(await cache.get('active-sessions:expired')).toBeUndefined();
    });

    it("reads a missing key as v1.1.6's Mongo store did, undefined", async () => {
        expect(await cache.get('login-attempts:9')).toBeUndefined();
    });

    it('deletes', async () => {
        await cache.set('active-sessions:gone', 1, 1800);
        await cache.del('active-sessions:gone');
        expect(
            await collection().countDocuments({ key: 'active-sessions:gone' }),
        ).toBe(0);
    });
});
