import { HttpException } from '@nestjs/common';
import { GraphQLError } from 'graphql';

/**
 * The extensions of a GraphQL error without the `name` that NestJS 8 adds
 * to an `HttpException`, so the client gets the shape v1.1.6 sent.
 *
 * Apollo Server (2 and 3, `enrichError`) copies an error's own enumerable
 * properties into `extensions.exception`. NestJS 7 left `HttpException`'s
 * `name` on the prototype; NestJS 8 sets it on the instance (`initName`),
 * so every uncaught `HttpException` would reach the client with
 * `extensions.exception.name` added. Only that key, and only for an
 * `HttpException`: any other error keeps what Apollo built. A
 * compatibility measure of ticket 07 (step 04), still needed on Apollo 3
 * (step 08's `record-both`).
 */
export function withoutHttpExceptionName(
    error: GraphQLError,
): GraphQLError['extensions'] {
    const exception: unknown = error.extensions?.exception;
    if (
        !(error.originalError instanceof HttpException) ||
        typeof exception !== 'object' ||
        exception === null ||
        !('name' in exception)
    ) {
        return error.extensions;
    }
    const asInV116 = { ...(exception as Record<string, unknown>) };
    delete asInV116.name;
    return { ...error.extensions, exception: asInV116 };
}
