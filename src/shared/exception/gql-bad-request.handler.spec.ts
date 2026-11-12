import {
    ArgumentsHost,
    BadRequestException,
    INestApplication,
    Logger,
    Module,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GqlContextType } from '@nestjs/graphql';
import { ClientRequest, request } from 'http';
import { AddressInfo } from 'net';
import { GqlBadRequestHandler } from './gql-bad-request.handler';
import { UserInputError } from './graphql-errors';

// A JSON body that does not parse reaches the global filter outside GraphQL.
// v1.1.6's filter threw there, which left the request unanswered; from
// Node 15 until Express 5 the rejection ended the process.

@Module({})
class EmptyModule {}

/** POSTs `body` as JSON to `/graphql`. */
function post(port: number, body: string): ClientRequest {
    const req = request({
        port,
        method: 'POST',
        path: '/graphql',
        headers: { 'content-type': 'application/json' },
    });
    req.end(body);
    return req;
}

/** Resolves with the status of the answer to `req`. */
function status(req: ClientRequest): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
        req.on('response', res => {
            res.resume();
            resolve(res.statusCode);
        });
        req.on('error', reject);
    });
}

function hostOfType(type: GqlContextType): ArgumentsHost {
    return { getType: () => type } as ArgumentsHost;
}

describe('GqlBadRequestHandler', () => {
    beforeEach(() =>
        jest
            .spyOn(Logger.prototype, 'error')
            .mockImplementation(() => undefined),
    );
    afterEach(() => jest.restoreAllMocks());

    it('throws nothing for a request outside GraphQL, and logs it without the body', () => {
        const host = hostOfType('http');
        // From Node 20 on, JSON.parse's message quotes the body it could not parse.
        const exception = new BadRequestException(
            'Unexpected token \'x\', "xpassword=S3cret" is not valid JSON',
        );

        expect(
            new GqlBadRequestHandler().catch(exception, host),
        ).toBeUndefined();
        expect(Logger.prototype.error).toHaveBeenCalledWith(
            'A request body that does not parse, refused before GraphQL and left unanswered as v1.1.6 leaves it',
        );
    });

    it("turns a resolver's BadRequestException into v1.1.6's UserInputError", () => {
        const host = hostOfType('graphql');
        const filter = new GqlBadRequestHandler();
        const exception = new BadRequestException([
            'input.name must be a string',
            'other',
        ]);

        let thrown: unknown;
        try {
            filter.catch(exception, host);
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(UserInputError);
        expect(thrown).toMatchObject({
            message: 'name must be a string',
            extensions: {
                code: 'BAD_USER_INPUT',
                messages: ['input.name must be a string', 'other'],
            },
        });
    });

    describe('in an application, for a JSON body that does not parse', () => {
        let app: INestApplication;
        let port: number;

        beforeAll(async () => {
            app = await NestFactory.create(EmptyModule, { logger: false });
            app.useGlobalFilters(new GqlBadRequestHandler());
            await app.listen(0, '127.0.0.1');
            port = (app.getHttpServer().address() as AddressInfo).port;
        });

        afterAll(async () => {
            await app.close();
        });

        it('leaves the request unanswered, as v1.1.6 does, and goes on answering', async () => {
            const logged = new Promise<void>(resolve =>
                jest
                    .mocked(Logger.prototype.error)
                    .mockImplementation(() => resolve()),
            );
            const malformed = post(port, '{"query": ');
            let answered = false;
            malformed.on('response', () => (answered = true));
            malformed.on('error', () => undefined);

            try {
                await logged;
                expect(Logger.prototype.error).toHaveBeenCalledWith(
                    expect.stringContaining('left unanswered'),
                );
                // No route here, so Nest's 404. The filter has already
                // returned for the first request; had Express answered it,
                // that answer would have been sent before this one.
                expect(await status(post(port, '{}'))).toBe(404);
                expect(answered).toBe(false);
            } finally {
                malformed.destroy();
            }
        });
    });
});
