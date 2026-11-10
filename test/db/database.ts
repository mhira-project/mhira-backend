import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { join } from 'path';
import { Client } from 'pg';
import { Logger, QueryRunner } from 'typeorm';

// The database the lookup tests run against (ticket 07, 07_D, P1): a
// Postgres 13 server, given by MHIRA_TEST_POSTGRES_URL, that has a database
// holding the seed (MHIRA_TEST_POSTGRES_TEMPLATE, default `seed`). Each test
// file works on a copy of it made fresh for the file, so the tests can write
// and leave nothing behind in the template. Run with `npm run test:db`.

const url = process.env.MHIRA_TEST_POSTGRES_URL;
const template = process.env.MHIRA_TEST_POSTGRES_TEMPLATE ?? 'seed';

/** Creates database `name` as a fresh copy of the template, replacing any earlier copy, and returns its connection settings. */
export async function freshDatabase(name: string) {
    if (!url) {
        throw new Error(
            'MHIRA_TEST_POSTGRES_URL is not set: the lookup tests need a Postgres server with the seed (see test/db/database.ts).',
        );
    }
    const server = new URL(url);
    const settings = {
        host: server.hostname,
        port: Number(server.port || 5432),
        username: decodeURIComponent(server.username),
        password: decodeURIComponent(server.password),
    };
    const admin = new Client({
        ...settings,
        user: settings.username,
        database: 'postgres',
    });
    await admin.connect();
    try {
        await admin.query(`DROP DATABASE IF EXISTS "${name}"`);
        await admin.query(`CREATE DATABASE "${name}" TEMPLATE "${template}"`);
    } finally {
        await admin.end();
    }
    return {
        type: 'postgres' as const,
        ...settings,
        database: name,
        // The entities as the app finds them (TYPEORM_ENTITIES_DIR).
        entities: [join(__dirname, '../../src/**/*.model.{js,ts}')],
        synchronize: false,
    };
}

/** A TypeORM logger that keeps every statement with its parameters. */
export class StatementRecorder implements Logger {
    readonly statements: string[] = [];

    logQuery(query: string, parameters?: unknown[], _runner?: QueryRunner) {
        this.statements.push(withParameters(query, parameters));
    }

    logQueryError(
        error: string | Error,
        query: string,
        parameters?: unknown[],
    ) {
        this.statements.push(
            `ERROR ${
                error instanceof Error ? error.message : error
            } :: ${withParameters(query, parameters)}`,
        );
    }

    logQuerySlow() {}
    logSchemaBuild() {}
    logMigration() {}
    log() {}

    /**
     * Runs `action` and returns what it returned or threw, with the
     * statements it sent: transaction control left out, and each SELECT's
     * column list (where it has no parentheses) written as `...`, since the
     * columns are the entity's and the conditions are what the tests are
     * about.
     */
    async observe<T>(
        action: () => Promise<T>,
    ): Promise<{ result?: T; error?: Error; sql: string[] }> {
        const start = this.statements.length;
        let result: T | undefined;
        let error: Error | undefined;
        try {
            result = await action();
        } catch (thrown) {
            error = thrown as Error;
        }
        const sql = this.statements
            .slice(start)
            .filter(
                statement =>
                    !/^(START TRANSACTION|COMMIT|ROLLBACK)$/.test(statement),
            )
            .map(statement =>
                statement.replace(
                    /SELECT (DISTINCT )?[^()]*? FROM /g,
                    'SELECT $1... FROM ',
                ),
            );
        return { result, error, sql };
    }
}

function withParameters(query: string, parameters?: unknown[]): string {
    return parameters && parameters.length > 0
        ? `${query} -- ${JSON.stringify(parameters)}`
        : query;
}

/**
 * A Nest testing module on a fresh copy of the seed (`name`), with TypeORM
 * as the app configures it, the repositories and the generated query
 * services of `entities`, and `providers` (the code under test and stubs
 * for what it needs beyond Postgres). Every statement goes to `recorder`.
 */
export async function lookupModule(
    name: string,
    entities: Parameters<typeof NestjsQueryTypeOrmModule.forFeature>[0],
    providers: Provider[],
): Promise<{ module: TestingModule; recorder: StatementRecorder }> {
    const recorder = new StatementRecorder();
    const options = await freshDatabase(name);
    const module = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                ...options,
                logging: true,
                logger: recorder,
            }),
            NestjsQueryTypeOrmModule.forFeature(entities),
        ],
        providers,
    }).compile();
    return { module, recorder };
}
