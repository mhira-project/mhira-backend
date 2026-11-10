import { GraphQLError, Kind } from 'graphql';

/**
 * Whether the error is a variable coercion error: a variable missing, null
 * where its type is non-null, or of a value its type refuses. Apollo Server
 * 3 relabels such an error BAD_USER_INPUT before formatError sees it
 * (`isBadUserInputGraphQLError` in apollo-server-core's request pipeline,
 * the same test as here); Apollo Server 2, and so v1.1.6, sent it as
 * INTERNAL_SERVER_ERROR, with the same message and HTTP status. formatError
 * gives it v1.1.6's code back: a compatibility measure of ticket 07 (step
 * 08), until Apollo 4 (step 15) changes these responses again.
 *
 * The relabelled error is a UserInputError without `nodes` (graphql-js
 * keeps them non-enumerable, and Apollo copies the enumerable properties);
 * its `originalError` holds the coercion error's own properties, `nodes`
 * among them.
 */
export function isVariableCoercionError(error: GraphQLError): boolean {
    const coerced = error.nodes
        ? error
        : (error.originalError as Partial<GraphQLError> | undefined);
    const [node, ...others] = coerced?.nodes ?? [];
    if (node?.kind !== Kind.VARIABLE_DEFINITION || others.length > 0) {
        return false;
    }
    const variable = `Variable "$${node.variable.name.value}" `;
    return [
        'got invalid value ',
        'of required type ',
        'of non-null type ',
    ].some(rest => coerced.message.startsWith(variable + rest));
}
