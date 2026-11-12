// Where the database and cache tests find their servers. The defaults are
// the ones test/docker-compose.yml starts (`npm run test:services`); set the
// MHIRA_TEST_* variables to use servers of your own. The tests create and
// drop databases and flush Redis, so never point them at data you keep.

export const POSTGRES_URL =
    process.env.MHIRA_TEST_POSTGRES_URL ??
    'postgres://mhira:mhira@127.0.0.1:54329';

export const MONGO_URL =
    process.env.MHIRA_TEST_MONGO_URL ?? 'mongodb://127.0.0.1:27029/mhira_test';

export const REDIS_URL =
    process.env.MHIRA_TEST_REDIS_URL ?? 'redis://127.0.0.1:63799';

// The backend reads its own connection settings from the environment when
// its modules load. They are set here, before any test file runs, so that a
// developer's .env can never send a test to a development database.
const redis = new URL(REDIS_URL);
process.env.MONGODB_CONNECTION_STRING = MONGO_URL;
process.env.REDIS_HOST = redis.hostname;
process.env.REDIS_PORT = redis.port || '6379';
