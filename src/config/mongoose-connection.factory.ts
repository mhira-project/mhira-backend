import * as mongoose from 'mongoose';

/**
 * Configures Mongoose when MongooseModule opens the connection, before any
 * model exists, so it holds wherever AppModule is built.
 *
 * Mongoose 5, which v1.1.6 runs, keeps filter keys that are not in the
 * schema; Mongoose 6 strips them unless strictQuery is off (Mongoose 7's
 * default again). The option is global to Mongoose and read at every query.
 */
export function mongooseConnectionFactory(
    connection: mongoose.Connection,
): mongoose.Connection {
    mongoose.set('strictQuery', false);
    return connection;
}
