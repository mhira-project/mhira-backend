import { GraphQLError } from 'graphql';
import { isVariableCoercionError } from './variable-coercion-error';
import { withoutHttpExceptionName } from './without-http-exception-name';

/**
 * The GraphQL module's `formatError`: every error reaches the client as a
 * GraphQLError with Apollo's message, path and extensions, apart from two
 * compatibility measures of ticket 07 that keep v1.1.6's shape: without the
 * `name` NestJS 8 adds to an HttpException (withoutHttpExceptionName), and
 * a variable coercion error with v1.1.6's code (isVariableCoercionError).
 */
export function formatError(error: GraphQLError): GraphQLError {
    const extensions = withoutHttpExceptionName(error);
    return new GraphQLError(
        typeof error.message === 'string'
            ? error.message
            : error.message['message'],
        null,
        null,
        null,
        error.path,
        error,
        isVariableCoercionError(error)
            ? { ...extensions, code: 'INTERNAL_SERVER_ERROR' }
            : extensions,
    );
}
