import { GraphQLError } from 'graphql';
import { withoutHttpExceptionName } from './without-http-exception-name';

/**
 * The GraphQL module's `formatError`: every error reaches the client as a
 * GraphQLError with Apollo's message, path and extensions, apart from the
 * `name` NestJS 8 adds to an HttpException (withoutHttpExceptionName).
 */
export function formatError(error: GraphQLError): GraphQLError {
    return new GraphQLError(
        typeof error.message === 'string'
            ? error.message
            : error.message['message'],
        null,
        null,
        null,
        error.path,
        error,
        withoutHttpExceptionName(error),
    );
}
