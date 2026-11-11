import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { withoutNestHttpExceptionKeys } from './without-nest-http-exception-keys';

// Ticket 07, steps 04 and 12: an uncaught HttpException reaches the client
// with the extensions v1.1.6 sent, without the `name` NestJS 8 and the
// `options` NestJS 9 set on the instance. Any other error keeps what Apollo
// built.

/** The error formatError receives: Apollo Server's enrichError (2 and 3) builds `exception` from the original error's own enumerable properties. */
function asApolloFormats(originalError: Error): GraphQLError {
    const exception: Record<string, unknown> = { ...originalError };
    return new GraphQLError(originalError.message, {
        path: ['generatePatientReport'],
        originalError,
        extensions: { code: 'INTERNAL_SERVER_ERROR', exception },
    });
}

/** The `exception` that asApolloFormats built, as a record: Apollo's typings declare only `code` and `stacktrace`. */
function exceptionOf(error: GraphQLError): Record<string, unknown> {
    return error.extensions.exception as Record<string, unknown>;
}

describe('withoutNestHttpExceptionKeys', () => {
    it.each([
        ['UnauthorizedException', new UnauthorizedException()],
        ['NotFoundException', new NotFoundException('No patient found')],
    ])(
        'leaves out the name and options NestJS adds to an %s, and keeps the rest',
        (_, exception) => {
            const error = asApolloFormats(exception);
            expect(exceptionOf(error).name).toBe(exception.constructor.name);
            expect(exceptionOf(error).options).toEqual({});

            const { name, options, ...asInV116 } = exceptionOf(error);
            expect(withoutNestHttpExceptionKeys(error)).toEqual({
                code: 'INTERNAL_SERVER_ERROR',
                exception: asInV116,
            });
            expect(Object.keys(asInV116).sort()).toEqual([
                'message',
                'response',
                'status',
            ]);
            expect(name).toBe(exception.constructor.name);
            expect(options).toEqual({});
        },
    );

    it('keeps an own name on any other error, as v1.1.6 sent it', () => {
        class QueryFailedError extends Error {
            readonly query = 'select 1';
            constructor() {
                super('syntax error');
                this.name = 'QueryFailedError';
            }
        }
        const error = asApolloFormats(new QueryFailedError());
        expect(withoutNestHttpExceptionKeys(error)).toBe(error.extensions);
        expect(exceptionOf(error).name).toBe('QueryFailedError');
    });

    it('returns extensions without an exception unchanged', () => {
        const error = new GraphQLError(
            'Variable "$id" of required type "Int!" was not provided.',
            { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
        );
        expect(withoutNestHttpExceptionKeys(error)).toBe(error.extensions);
    });
});
