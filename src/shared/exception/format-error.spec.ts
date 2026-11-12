import { NotFoundException } from '@nestjs/common';
import { ApolloServer, GraphQLResponse } from '@apollo/server';
import { GraphQLFormattedError } from 'graphql';
import { DatabaseError } from 'pg-protocol';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { formatError } from './format-error';
import { UserInputError } from './graphql-errors';

// What a client receives for an error, from the installed Apollo Server
// running the module's formatError without stack traces, as app.module.ts
// configures it. Pinned per error kind: the code, the top-level message and
// the path. From Apollo 4 no error carries `extensions.exception`, and
// formatError leaves out the `locations` Apollo 4 adds, which v1.1.6 never
// sent.

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
        includeStacktraceInErrorResponses: false,
    });
    await apollo.start();
    return apollo;
}

const QUERY = 'query ($id: Int!) { assessment(id: $id) }';

/** The errors of a single result. */
function errorsOf(response: GraphQLResponse): readonly GraphQLFormattedError[] {
    if (response.body.kind !== 'single') {
        throw new Error('expected a single result');
    }
    return response.body.singleResult.errors ?? [];
}

/** The error a client receives, as JSON, when the resolver throws `thrown`. */
async function received(thrown: Error) {
    const errors = errorsOf(
        await (await server(() => thrown)).executeOperation({
            query: QUERY,
            variables: { id: 1 },
        }),
    );
    expect(errors).toHaveLength(1);
    return JSON.parse(JSON.stringify(errors[0]));
}

/** A pg error as the driver raises it for a value that is not an integer. */
function invalidInteger(): DatabaseError {
    const error = new DatabaseError(
        'invalid input syntax for type integer: "abc"',
        104,
        'error',
    );
    Object.assign(error, {
        severity: 'ERROR',
        code: '22P02',
        file: 'numutils.c',
        line: '320',
        routine: 'pg_strtoint32',
    });
    return error;
}

const SQL =
    'SELECT "Patient"."id" FROM "patient" "Patient" WHERE "Patient"."id" = $1';

describe('formatError through Apollo Server', () => {
    // Apollo 3 and later relabel a missing or null variable
    // BAD_USER_INPUT; v1.1.6 (Apollo 2) sent INTERNAL_SERVER_ERROR,
    // and relabelled only a value its type refuses.
    it.each([
        [
            'null for a non-null variable',
            { id: null },
            'Variable "$id" of non-null type "Int!" must not be null.',
            'INTERNAL_SERVER_ERROR',
        ],
        [
            'a missing variable',
            {},
            'Variable "$id" of required type "Int!" was not provided.',
            'INTERNAL_SERVER_ERROR',
        ],
        [
            'a value its type refuses',
            { id: 'abc' },
            'Variable "$id" got invalid value "abc"; Int cannot represent non-integer value: "abc"',
            'BAD_USER_INPUT',
        ],
    ])(
        "a variable coercion error keeps v1.1.6's code: %s",
        async (_, variables, message, code) => {
            const errors = errorsOf(
                await (await server()).executeOperation({
                    query: QUERY,
                    variables,
                }),
            );
            expect(errors).toEqual([{ message, extensions: { code } }]);
        },
    );

    it("a resolver's UserInputError keeps BAD_USER_INPUT, even worded like a variable error", async () => {
        const message =
            'Variable "$id" of non-null type "Int!" must not be null.';
        expect(await received(new UserInputError(message))).toEqual({
            message,
            path: ['assessment'],
            extensions: { code: 'BAD_USER_INPUT' },
        });
    });

    it('an uncaught HttpException keeps its message and code, without exception', async () => {
        expect(
            await received(new NotFoundException('No patient found')),
        ).toEqual({
            message: 'No patient found',
            path: ['assessment'],
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
    });

    it('the input check: messages stay, without exception', async () => {
        const messages = [
            'input.name must be shorter than or equal to 15 characters',
        ];
        expect(
            await received(
                new UserInputError(
                    'name must be shorter than or equal to 15 characters',
                    { messages },
                ),
            ),
        ).toEqual({
            message: 'name must be shorter than or equal to 15 characters',
            path: ['assessment'],
            extensions: { messages, code: 'BAD_USER_INPUT' },
        });
    });

    it("TypeORM's EntityNotFoundError keeps its message and code, without exception", async () => {
        expect(
            await received(new EntityNotFoundError(Assessment, 999999)),
        ).toEqual({
            message:
                'Could not find any entity of type "Assessment" matching: 999999',
            path: ['assessment'],
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
    });

    it("TypeORM's QueryFailedError keeps its message and code, and no longer sends the SQL", async () => {
        expect(
            await received(
                new QueryFailedError(SQL, ['abc'], invalidInteger()),
            ),
        ).toEqual({
            message: 'invalid input syntax for type integer: "abc"',
            path: ['assessment'],
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
    });
});
