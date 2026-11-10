import { NotFoundException } from '@nestjs/common';
import { ApolloServer, UserInputError } from 'apollo-server-express';
import { DatabaseError } from 'pg-protocol';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { formatError } from './format-error';

// Ticket 07: what a client receives for an error, from the installed Apollo
// Server running the module's formatError with `debug: false`, as
// app.module.ts configures it. Pinned per error kind (07_D, T3): the code,
// the top-level message, the path and `extensions.exception` as the
// register allows it for the installed libraries. formatError builds its
// error without the query's nodes, so no error carries `locations`, as on
// v1.1.6.

const { version: typeormVersion } = require('typeorm/package.json') as {
    version: string;
};
const TYPEORM_0_3 = typeormVersion.startsWith('0.3.');

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

/** The error a client receives, as JSON, when the resolver throws `thrown`. */
async function received(thrown: Error) {
    const response = await (await server(() => thrown)).executeOperation({
        query: QUERY,
        variables: { id: 1 },
    });
    expect(response.errors).toHaveLength(1);
    return JSON.parse(JSON.stringify(response.errors[0]));
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

const PG_FIELDS = {
    length: 104,
    severity: 'ERROR',
    code: '22P02',
    file: 'numutils.c',
    line: '320',
    routine: 'pg_strtoint32',
};
const SQL =
    'SELECT "Patient"."id" FROM "patient" "Patient" WHERE "Patient"."id" = $1';

describe('formatError through Apollo Server', () => {
    // Step 08: Apollo 3 relabels a missing or null variable BAD_USER_INPUT;
    // v1.1.6 (Apollo 2) sent INTERNAL_SERVER_ERROR, recorded for eight
    // operations with a null id (ticket 04's wrong-input section), and
    // relabelled only a value its type refuses, recorded for fourteen.
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
            const response = await (await server()).executeOperation({
                query: QUERY,
                variables,
            });
            expect(response.errors).toEqual([
                expect.objectContaining({ message, extensions: { code } }),
            ]);
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

    it('an uncaught HttpException keeps the shape v1.1.6 sent, without the name NestJS 8 adds (T3)', async () => {
        expect(
            await received(new NotFoundException('No patient found')),
        ).toEqual({
            message: 'No patient found',
            path: ['assessment'],
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                exception: {
                    response: {
                        statusCode: 404,
                        message: 'No patient found',
                        error: 'Not Found',
                    },
                    status: 404,
                    message: 'No patient found',
                },
            },
        });
    });

    it('the input check: messages stay, exception is gone from Apollo 3 on (decision F, T3)', async () => {
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
            extensions: { code: 'BAD_USER_INPUT', messages },
        });
    });

    it("TypeORM's EntityNotFoundError: the message stays; exception as the installed TypeORM puts it (decision K, T3)", async () => {
        const message =
            'Could not find any entity of type "Assessment" matching: 999999';
        expect(
            await received(new EntityNotFoundError(Assessment, 999999)),
        ).toEqual({
            message,
            path: ['assessment'],
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                // TypeORM 0.3: `name` is a getter on the prototype and the
                // criteria are an own property (register, decision K).
                exception: TYPEORM_0_3
                    ? { criteria: 999999, message }
                    : { name: 'EntityNotFound', message },
            },
        });
    });

    it("TypeORM's QueryFailedError: the message stays; exception as the installed TypeORM puts it (decision K, T3)", async () => {
        const message = 'invalid input syntax for type integer: "abc"';
        const error = await received(
            new QueryFailedError(SQL, ['abc'], invalidInteger()),
        );
        expect(error.message).toBe(message);
        expect(error.path).toEqual(['assessment']);
        expect(error.extensions.code).toBe('INTERNAL_SERVER_ERROR');
        if (TYPEORM_0_3) {
            // TypeORM 0.3 (register, decision K): no `name`, no `message`,
            // `driverError` added, holding nothing the payload lacks.
            expect(error.extensions.exception).toEqual({
                query: SQL,
                parameters: ['abc'],
                driverError: { ...PG_FIELDS, name: 'error' },
                ...PG_FIELDS,
            });
            const { driverError, ...rest } = error.extensions.exception;
            for (const [key, value] of Object.entries(driverError)) {
                if (key !== 'name') expect(rest[key]).toEqual(value);
            }
        } else {
            expect(error.extensions.exception).toEqual({
                message,
                ...PG_FIELDS,
                name: 'QueryFailedError',
                query: SQL,
                parameters: ['abc'],
            });
        }
    });
});
