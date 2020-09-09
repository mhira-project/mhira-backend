import { redisConfig } from './redis.config';

export enum queueName {
    default = 'default',
    billsQueue = 'bill',
}

export const queueConfig = {

    defaultQueue: {
        name: queueName.default,
        redis: redisConfig.bullQueue,
    },

    billsQueue: {
        name: queueName.billsQueue,
        redis: redisConfig.bullQueue,
    },

};
