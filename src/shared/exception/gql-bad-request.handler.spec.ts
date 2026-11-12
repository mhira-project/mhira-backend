import {
    BadRequestException,
    INestApplication,
    Logger,
    Module,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { request } from 'http';
import { AddressInfo } from 'net';
import { GqlBadRequestHandler } from './gql-bad-request.handler';
import { UserInputError } from './graphql-errors';

// Ticket 07, B62: a JSON body that does not parse reaches the global filter
// outside GraphQL. v1.1.6's filter threw there, which left the request
// unanswered; from Node 15 on the rejection ended the process. That the
// backend's process survives is shown on the image by mhira-api-tests'
// HTTP surface test (the container's restart count).

@Module({})
class EmptyModule {}

/** POSTs `body` as JSON; resolves with the status, or with `undefined` when no answer came within `ms`. */
function post(
    port: number,
    body: string,
    ms: number,
): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
        const req = request(
            {
                port,
                method: 'POST',
                path: '/graphql',
                headers: { 'content-type': 'application/json' },
            },
            res => {
                res.resume();
                resolve(res.statusCode);
            },
        );
        req.setTimeout(ms, () => {
            req.destroy();
            resolve(undefined);
        });
        req.on('error', error => (req.destroyed ? undefined : reject(error)));
        req.end(body);
    });
}

describe('GqlBadRequestHandler', () => {
    beforeEach(() =>
        jest
            .spyOn(Logger.prototype, 'error')
            .mockImplementation(() => undefined),
    );
    afterEach(() => jest.restoreAllMocks());

    it('throws nothing for a request outside GraphQL, and logs it without the body', () => {
        const host = new ExecutionContextHost([]);
        host.setType('http');
        // From Node 20 on, JSON.parse's message quotes the body it could not parse.
        const exception = new BadRequestException(
            'Unexpected token \'x\', "xpassword=S3cret" is not valid JSON',
        );

        expect(
            new GqlBadRequestHandler().catch(exception, host),
        ).toBeUndefined();
        expect(Logger.prototype.error).toHaveBeenCalledWith(
            'A request body that does not parse, refused before GraphQL and left unanswered as v1.1.6 leaves it (B62)',
        );
    });

    it("turns a resolver's BadRequestException into v1.1.6's UserInputError", () => {
        const host = new ExecutionContextHost([]);
        host.setType('graphql');
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
            expect(await post(port, '{"query": ', 1000)).toBeUndefined();
            expect(Logger.prototype.error).toHaveBeenCalledWith(
                expect.stringContaining(
                    'left unanswered as v1.1.6 leaves it (B62)',
                ),
            );
            // No route here, so Nest's 404.
            expect(await post(port, '{}', 1000)).toBe(404);
        });
    });
});
