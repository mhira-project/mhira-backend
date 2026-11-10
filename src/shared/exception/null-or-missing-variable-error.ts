import { GraphQLError, Kind } from 'graphql';

/**
 * Whether the error says a variable is missing ("of required type … was
 * not provided") or null where its type is non-null ("of non-null type …
 * must not be null"). Apollo Server 2, and so v1.1.6, relabelled only a
 * variable of a value its type refuses ("got invalid value") as
 * BAD_USER_INPUT and sent these two as INTERNAL_SERVER_ERROR; Apollo Server
 * 3 relabels all three before formatError sees them
 * (`isBadUserInputGraphQLError` in apollo-server-core's request pipeline).
 * formatError gives these two v1.1.6's code back, with the same message and
 * HTTP status: a compatibility measure of ticket 07 (step 08), until Apollo
 * 4 (step 15) changes these responses again.
 *
 * The relabelled error is a UserInputError without `nodes` (graphql-js
 * keeps them non-enumerable, and Apollo copies the enumerable properties);
 * its `originalError` holds the coercion error's own properties, `nodes`
 * among them.
 */
export function isNullOrMissingVariableError(error: GraphQLError): boolean {
    const coerced = error.nodes
        ? error
        : (error.originalError as Partial<GraphQLError> | undefined);
    const [node, ...others] = coerced?.nodes ?? [];
    if (node?.kind !== Kind.VARIABLE_DEFINITION || others.length > 0) {
        return false;
    }
    const variable = `Variable "$${node.variable.name.value}" `;
    return ['of required type ', 'of non-null type '].some(rest =>
        coerced.message.startsWith(variable + rest),
    );
}
