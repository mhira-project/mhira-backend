import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { DataSource, Logger, QueryRunner } from 'typeorm';
import { TYPEORM_WHERE_VALUES } from 'src/config/config.service';
import { POSTGRES_URL } from '../services';

// The database tests run the backend's own code against a real Postgres.
// Each test file gets a database of its own, created empty and brought to
// the current schema by the migrations in src/migrations, exactly as a new
// installation is. A file then creates the few rows it needs, so the tests
// depend on no data from anywhere else. Run with `npm run test:db`.

/** The conditions of a WHERE clause as TypeORM writes them: each in parentheses, and all of them together. */
export function conditions(...parts: string[]): string {
    return `((${parts.join(') AND (')}))`;
}

/** A WHERE clause on a soft-deletable entity: the conditions, and the row not deleted. */
export function whereLive(entity: string, ...parts: string[]): string {
    return `WHERE ( ${conditions(
        ...parts,
    )} ) AND ( "${entity}"."deletedAt" IS NULL )`;
}

// Four migrations rewrite documents in Mongo and change nothing in the
// Postgres schema; the database tests leave them out and need no Mongo.
const MONGO_MIGRATIONS = [
    '1645105081399-QuestionnaireVersion.ts',
    '1650359016504-CleanQuestionnaireVersions.ts',
    '1683209802553-AssessmentStatus.ts',
    '1689180681401-QuestionnaireOldVersions.ts',
];
const MIGRATIONS_DIR = join(__dirname, '../../src/migrations');
const POSTGRES_MIGRATIONS = readdirSync(MIGRATIONS_DIR)
    .filter(file => !MONGO_MIGRATIONS.includes(file))
    .map(file => join(MIGRATIONS_DIR, file));

/** Creates database `name` empty, replacing any earlier one, runs the migrations on it and returns its connection settings. */
export async function freshDatabase(name: string) {
    const server = new URL(POSTGRES_URL);
    const settings = {
        type: 'postgres' as const,
        host: server.hostname,
        port: Number(server.port || 5432),
        username: decodeURIComponent(server.username),
        password: decodeURIComponent(server.password),
    };
    const admin = new Client({
        host: settings.host,
        port: settings.port,
        user: settings.username,
        password: settings.password,
        database: 'postgres',
    });
    try {
        await admin.connect();
    } catch (error) {
        throw new Error(
            `No Postgres at ${settings.host}:${settings.port} (${error.message}). Start the test servers with \`npm run test:services\`.`,
        );
    }
    try {
        await admin.query(`DROP DATABASE IF EXISTS "${name}"`);
        await admin.query(`CREATE DATABASE "${name}"`);
    } finally {
        await admin.end();
    }

    const migrations = new DataSource({
        ...settings,
        database: name,
        migrations: POSTGRES_MIGRATIONS,
    });
    await migrations.initialize();
    try {
        await migrations.runMigrations();
    } finally {
        await migrations.destroy();
    }

    return {
        ...settings,
        database: name,
        // The entities as the app finds them (TYPEORM_ENTITIES_DIR).
        entities: [join(__dirname, '../../src/**/*.model.{js,ts}')],
        synchronize: false,
        // As the app sets it (config.service.ts).
        invalidWhereValuesBehavior: TYPEORM_WHERE_VALUES,
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
 * A Nest testing module on a fresh database (`name`), with TypeORM as the
 * app configures it, the repositories and the generated query
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
