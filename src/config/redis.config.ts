import { Str } from 'src/shared/helpers/string.helper';

const redisPrefix = process.env.REDIS_PREFIX ||
    Str.slug(process.env.APP_NAME || 'mhira') + ':' + Str.slug(process.env.APP_ENV || 'production');

export const redisConfig = {

    default: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        db: parseInt(process.env.REDIS_DB, 10) || 0,
        password: process.env.REDIS_PASSWORD,
        prefix: redisPrefix + ':default:',
    },

    typeormCache: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        db: parseInt(process.env.REDIS_ORM_CACHE_DB, 10) || 0,
        password: process.env.REDIS_PASSWORD,
        prefix: redisPrefix + ':typeorm:',
    },

    bullQueue: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        db: parseInt(process.env.REDIS_QUEUE_DB, 10) || 0,
        password: process.env.REDIS_PASSWORD,
        prefix: redisPrefix + ':bull',
    } as const,

};
