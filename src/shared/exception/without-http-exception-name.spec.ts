import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { withoutHttpExceptionName } from './without-http-exception-name';

// Ticket 07, step 04: an uncaught HttpException reaches the client with the
// extensions v1.1.6 sent, without the `name` NestJS 8 sets on the instance.
// Any other error keeps what Apollo built.

/** The error formatError receives: Apollo Server's enrichError (2 and 3) builds `exception` from the original error's own enumerable properties. */
function asApolloFormats(originalError: Error): GraphQLError {
    const exception: Record<string, unknown> = { ...originalError };
    return new GraphQLError(
        originalError.message,
        null,
        null,
        null,
        ['generatePatientReport'],
        originalError,
        {
            code: 'INTERNAL_SERVER_ERROR',
            exception,
        },
    );
}

describe('withoutHttpExceptionName', () => {
    it.each([
        ['UnauthorizedException', new UnauthorizedException()],
        ['NotFoundException', new NotFoundException('No patient found')],
    ])(
        'leaves out the name NestJS 8 adds to an %s, and keeps the rest',
        (_, exception) => {
            const error = asApolloFormats(exception);
            expect(error.extensions.exception.name).toBe(
                exception.constructor.name,
            );

            const { name, ...asInV116 } = error.extensions.exception;
            expect(withoutHttpExceptionName(error)).toEqual({
                code: 'INTERNAL_SERVER_ERROR',
                exception: asInV116,
            });
            expect(Object.keys(asInV116).sort()).toEqual([
                'message',
                'response',
                'status',
            ]);
            expect(name).toBe(exception.constructor.name);
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
        expect(withoutHttpExceptionName(error)).toBe(error.extensions);
        expect(error.extensions.exception.name).toBe('QueryFailedError');
    });

    it('returns extensions without an exception unchanged', () => {
        const error = new GraphQLError(
            'Variable "$id" of required type "Int!" was not provided.',
            null,
            null,
            null,
            null,
            null,
            { code: 'INTERNAL_SERVER_ERROR' },
        );
        expect(withoutHttpExceptionName(error)).toBe(error.extensions);
    });
});
