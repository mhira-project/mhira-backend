import { HttpException } from '@nestjs/common';
import { GraphQLError } from 'graphql';

/** The own properties NestJS sets on an `HttpException` that NestJS 7 did not: `name` from 8 (`initName`), `options` from 9. */
const KEYS_ADDED_BY_NEST = ['name', 'options'];

/**
 * The extensions of a GraphQL error without the keys that NestJS 8 and 9
 * add to an `HttpException`, so the client gets the shape v1.1.6 sent.
 *
 * Apollo Server (2 and 3, `enrichError`) copies an error's own enumerable
 * properties into `extensions.exception`. NestJS 7 left `HttpException`'s
 * `name` on the prototype; NestJS 8 sets it on the instance, and NestJS 9
 * also keeps the constructor's `options` there (`{}` for the built-in
 * exceptions MHIRA throws). Every uncaught `HttpException` would reach the
 * client with those keys added. Only these keys, and only for an
 * `HttpException`: any other error keeps what Apollo built. A compatibility
 * measure of ticket 07 (steps 04 and 12), until Apollo 4 stops sending
 * `exception` (decision F).
 */
export function withoutNestHttpExceptionKeys(
    error: GraphQLError,
): GraphQLError['extensions'] {
    const exception: unknown = error.extensions?.exception;
    if (
        !(error.originalError instanceof HttpException) ||
        typeof exception !== 'object' ||
        exception === null ||
        !KEYS_ADDED_BY_NEST.some(key => key in exception)
    ) {
        return error.extensions;
    }
    const asInV116 = { ...(exception as Record<string, unknown>) };
    for (const key of KEYS_ADDED_BY_NEST) delete asInV116[key];
    return { ...error.extensions, exception: asInV116 };
}
