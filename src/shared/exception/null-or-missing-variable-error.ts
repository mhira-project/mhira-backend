import { GraphQLError, Kind } from 'graphql';

/**
 * Whether the error says a variable is missing ("of required type … was
 * not provided") or null where its type is non-null ("of non-null type …
 * must not be null"). Apollo Server 2, and so v1.1.6, relabelled only a
 * variable of a value its type refuses ("got invalid value") as
 * BAD_USER_INPUT and sent these two as INTERNAL_SERVER_ERROR; Apollo Server
 * 3 and 4 relabel all three before formatError sees them
 * (`isBadUserInputGraphQLError` in the request pipeline). formatError gives
 * these two v1.1.6's code back, with the same message and HTTP status: a
 * compatibility measure of ticket 07 (steps 08 and 15).
 *
 * Apollo 4 hands formatError its own UserInputError, which keeps the
 * coercion error's `nodes`.
 */
export function isNullOrMissingVariableError(error: unknown): boolean {
    if (!(error instanceof GraphQLError)) {
        return false;
    }
    const [node, ...others] = error.nodes ?? [];
    if (node?.kind !== Kind.VARIABLE_DEFINITION || others.length > 0) {
        return false;
    }
    const variable = `Variable "$${node.variable.name.value}" `;
    return ['of required type ', 'of non-null type '].some(rest =>
        error.message.startsWith(variable + rest),
    );
}
