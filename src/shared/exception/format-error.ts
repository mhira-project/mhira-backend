import { GraphQLFormattedError } from 'graphql';
import { isNullOrMissingVariableError } from './null-or-missing-variable-error';

/**
 * The GraphQL module's `formatError`: every error reaches the client with
 * the message, path and extensions Apollo Server formatted, and without
 * the `locations` Apollo 4 adds, which v1.1.6 never sent. One compatibility
 * measure of the stack upgrade: a missing or null variable keeps v1.1.6's code
 * (isNullOrMissingVariableError).
 */
export function formatError(
    formattedError: GraphQLFormattedError,
    error: unknown,
): GraphQLFormattedError {
    const { message, path, extensions } = formattedError;
    return {
        message,
        ...(path && { path }),
        extensions: isNullOrMissingVariableError(error)
            ? { ...extensions, code: 'INTERNAL_SERVER_ERROR' }
            : extensions,
    };
}
