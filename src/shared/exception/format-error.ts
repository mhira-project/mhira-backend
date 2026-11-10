import { GraphQLError } from 'graphql';
import { isNullOrMissingVariableError } from './null-or-missing-variable-error';
import { withoutHttpExceptionName } from './without-http-exception-name';

/**
 * The GraphQL module's `formatError`: every error reaches the client as a
 * GraphQLError with Apollo's message, path and extensions, apart from two
 * compatibility measures of ticket 07 that keep v1.1.6's shape: without the
 * `name` NestJS 8 adds to an HttpException (withoutHttpExceptionName), and
 * a missing or null variable with v1.1.6's code (isNullOrMissingVariableError).
 */
export function formatError(error: GraphQLError): GraphQLError {
    const extensions = withoutHttpExceptionName(error);
    return new GraphQLError(
        typeof error.message === 'string'
            ? error.message
            : error.message['message'],
        {
            path: error.path,
            originalError: error,
            extensions: isNullOrMissingVariableError(error)
                ? { ...extensions, code: 'INTERNAL_SERVER_ERROR' }
                : extensions,
        },
    );
}
