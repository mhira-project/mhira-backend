import { GraphQLError } from 'graphql';
import { isNullOrMissingVariableError } from './null-or-missing-variable-error';
import { withoutNestHttpExceptionKeys } from './without-nest-http-exception-keys';

/**
 * The GraphQL module's `formatError`: every error reaches the client as a
 * GraphQLError with Apollo's message, path and extensions, apart from two
 * compatibility measures of ticket 07 that keep v1.1.6's shape: without the
 * keys NestJS 8 and 9 add to an HttpException (withoutNestHttpExceptionKeys), and
 * a missing or null variable with v1.1.6's code (isNullOrMissingVariableError).
 */
export function formatError(error: GraphQLError): GraphQLError {
    const extensions = withoutNestHttpExceptionKeys(error);
    return new GraphQLError(error.message, {
        path: error.path,
        originalError: error,
        extensions: isNullOrMissingVariableError(error)
            ? { ...extensions, code: 'INTERNAL_SERVER_ERROR' }
            : extensions,
    });
}
