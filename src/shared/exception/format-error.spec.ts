import { ApolloServer, UserInputError } from 'apollo-server-express';
import { formatError } from './format-error';

// Ticket 07: what a client receives for an error, from the installed Apollo
// Server running the module's formatError with `debug: false`, as
// app.module.ts configures it.

/** Apollo Server with one query, `assessment(id: Int!)`, whose resolver throws what `throwing` gives. */
async function server(throwing: () => Error = () => new Error('unused')) {
    const apollo = new ApolloServer({
        typeDefs: 'type Query { assessment(id: Int!): Int }',
        resolvers: {
            Query: {
                assessment: () => {
                    throw throwing();
                },
            },
        },
        formatError,
        debug: false,
    });
    await apollo.start();
    return apollo;
}

const QUERY = 'query ($id: Int!) { assessment(id: $id) }';

describe('formatError through Apollo Server', () => {
    // Step 08: Apollo 3 relabels a variable coercion error BAD_USER_INPUT;
    // v1.1.6 sent INTERNAL_SERVER_ERROR, recorded for eight operations
    // with a null id (ticket 04's wrong-input section).
    it.each([
        [
            'null for a non-null variable',
            { id: null },
            'Variable "$id" of non-null type "Int!" must not be null.',
        ],
        [
            'a missing variable',
            {},
            'Variable "$id" of required type "Int!" was not provided.',
        ],
        [
            'a value its type refuses',
            { id: 'abc' },
            'Variable "$id" got invalid value "abc"; Int cannot represent non-integer value: "abc"',
        ],
    ])(
        "a variable coercion error keeps v1.1.6's code: %s",
        async (_, variables, message) => {
            const response = await (await server()).executeOperation({
                query: QUERY,
                variables,
            });
            expect(response.errors).toEqual([
                expect.objectContaining({
                    message,
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                }),
            ]);
        },
    );

    it("a resolver's UserInputError keeps BAD_USER_INPUT, even worded like a variable error", async () => {
        const message =
            'Variable "$id" of non-null type "Int!" must not be null.';
        const response = await (
            await server(() => new UserInputError(message))
        ).executeOperation({ query: QUERY, variables: { id: 1 } });
        expect(response.errors).toEqual([
            expect.objectContaining({
                message,
                path: ['assessment'],
                extensions: { code: 'BAD_USER_INPUT' },
            }),
        ]);
    });
});
