import { DataSourceOptions } from 'typeorm';

require('dotenv').config();

/** What a null or undefined value in a TypeORM condition does (getTypeOrmConnection). */
export const TYPEORM_WHERE_VALUES = {
    null: 'sql-null',
    undefined: 'throw',
} as const;

class ConfigService {
    constructor(private env: { [k: string]: string | undefined }) {}

    private getValue(
        key: string,
        throwOnMissing = true,
        defaultValue?: string,
    ): string {
        const value = this.env[key];

        if (!value && throwOnMissing) {
            // throw new Error(`config error - missing env.${key}`);
        }

        // Return default value if not found.
        if (!value && defaultValue !== undefined) {
            return defaultValue;
        }

        return value;
    }

    public ensureValues(keys: string[]) {
        keys.forEach(k => this.getValue(k, true));
        return this;
    }

    public getAppUrl() {
        return this.getValue('APP_URL') ?? 'http://localhost:3000/';
    }

    public getPort() {
        return this.getValue('SERVER_PORT', true);
    }

    public getSenderMail() {
        return this.getValue('SENDER_MAIL', true);
    }

    public getFrontendEncryptionKey() {
        return this.getValue('FRONTEND_ENCRYPTION_KEY', true);
    }

    public isProduction() {
        const mode = this.getValue('MODE', false);
        return mode != 'DEV';
    }

    public isGraphqlPlaygroundEnabled() {
        const enableFlag = this.getValue(
            'GRAPHQL_PLAYGROUND_ENABLED',
            false,
            'false',
        );
        return enableFlag.toLowerCase() === 'true';
    }

    public getMongoConnectionString() {
        return this.getValue('MONGODB_CONNECTION_STRING', true);
    }

    public getTokenConfig(): any {
        return {
            secret: this.getValue('SECRET'),
            refreshTokenSecret: this.getValue('REFRESH_TOKEN_SECRET'),
            tokenLife: parseInt(this.getValue('TOKEN_LIFE')),
            refreshTokenLife: parseInt(this.getValue('REFRESH_TOKEN_LIFE')),
        };
    }

    /** The Postgres connection, from the TYPEORM_* variables, for the app and the migration CLI alike. */
    private getTypeOrmConnection() {
        return {
            type: this.getValue('TYPEORM_CONNECTION') as 'postgres',
            host: this.getValue('TYPEORM_HOST'),
            port: parseInt(this.getValue('TYPEORM_PORT'), 10),
            username: this.getValue('TYPEORM_USERNAME'),
            password: this.getValue('TYPEORM_PASSWORD'),
            database: this.getValue('TYPEORM_DATABASE'),
            // TypeORM 0.2 compared a null value with IS NULL; 0.3 drops the
            // condition unless told otherwise, and on undefined finds the
            // first row, where 0.2 found none. undefined throws instead.
            invalidWhereValuesBehavior: TYPEORM_WHERE_VALUES,
        };
    }

    public getTypeOrmConfig(): any {
        const entities: any = [
            __dirname + this.getValue('TYPEORM_ENTITIES_DIR'),
        ];
        return {
            ...this.getTypeOrmConnection(),
            entities,
            // The app never synchronizes its schema, whatever
            // TYPEORM_SYNCHRONIZE says (ticket 07, decision I).
            synchronize: false,
            logging: this.getValue('TYPEORM_LOGGING') === 'true',
            migrationsRun: this.getValue('TYPEORM_MIGRATIONS_RUN') === 'true',
            // Finds no migration (the migration CLI in start.sh runs them),
            // and creates the default-named table empty, as v1.1.6 does.
            migrations: ['../dist/migrations/*.{js}'],
        };
    }

    /**
     * The migration CLI's DataSource (src/data-source.ts, start.sh): the
     * variables TypeORM 0.2's CLI read itself, and no entity, since no
     * migration uses one. TYPEORM_MIGRATIONS_TABLE_NAME names the history
     * table as it did, default `migrations` (ticket 07, decision I). The
     * CLI itself switches synchronize off and logs every query, on 0.3 as
     * on 0.2.
     */
    public getMigrationDataSourceOptions(): DataSourceOptions {
        return {
            ...this.getTypeOrmConnection(),
            // A comma-separated list, as TypeORM 0.2's CLI read it.
            migrations: this.getValue('TYPEORM_MIGRATIONS', false, '')
                .split(',')
                .map(glob => glob.trim())
                .filter(Boolean),
            migrationsTableName: this.getValue(
                'TYPEORM_MIGRATIONS_TABLE_NAME',
                false,
                'migrations',
            ),
        };
    }

    public getMailerConfig(): any {
        return {
            transport: {
                host: this.getValue('MAIL_HOST'),
                secure:
                    this.getValue('MAIL_SECURE') &&
                    this.getValue('MAIL_SECURE').toLowerCase() === 'true',
                port: this.getValue('MAIL_PORT'),
                auth: {
                    user: this.getValue('MAIL_USER'),
                    pass: this.getValue('MAIL_PASS'),
                },
            },
        };
    }

    public getStorageConfig(): any {
        const dateStrPrefix = new Date().toISOString().split('T')[0];
        return {
            accessKeyId: this.getValue('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.getValue('AWS_SECRET_ACCESS_KEY'),
            region: this.getValue('AWS_DEFAULT_REGION'),
            bucket:
                this.getValue('AWS_BUCKET') ||
                this.getValue('AWS_S3_BUCKET_NAME'),
            basePath: `pasha/${dateStrPrefix}`,
            fileSize: 1000 * 1024 * 1024,
            acl: 'private',
        };
    }
}

const configService = new ConfigService(process.env).ensureValues([
    'SECRET',
    'REFRESH_TOKEN_SECRET',
    'TOKEN_LIFE',
    'REFRESH_TOKEN_LIFE',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE',
    'SERVER_PORT',
]);

export { configService };
