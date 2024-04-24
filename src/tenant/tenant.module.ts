import {
    DynamicModule,
    Global,
    Injectable,
    Module,
    Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { Connection, createConnection, getConnectionManager } from 'typeorm';

export const CONNECTION = 'CONNECTION';


@Injectable()
export class ConnectionProvider {
    // Optionally handle connection caching or management
    async getTenantConnection(tenantId: string): Promise<Connection> {
        const connectionName = 'mhira';//tenantId;
        const connectionManager = getConnectionManager()

        if (connectionManager.has(connectionName)) {
            const connection = connectionManager.get(connectionName);
            console.log('connection exists')

            if (!connection.isConnected) {
                await connection.connect();
            }
            return connection;
        }

        try {
            console.log('creating new connection')
            return createConnection(
                {
                    name: connectionName,
                    type: process.env.TYPEORM_CONNECTION as 'postgres',
                    host: process.env.TYPEORM_HOST,
                    port: parseInt(process.env.TYPEORM_PORT, 10),
                    username: process.env.TYPEORM_USERNAME,
                    password: process.env.TYPEORM_PASSWORD,
                    database: tenantId,
                    logging: process.env.TYPEORM_LOGGING === 'true',
                    entities: [
                        __dirname + process.env.TYPEORM_ENTITIES_DIR,
                    ],
                    synchronize:
                        process.env.TYPEORM_SYNCHRONIZE === 'true',
                },
            );

        } catch (err) {
            throw err
        }
    }
}

@Global()
@Module({
    providers: [ConnectionProvider],
    exports: [ConnectionProvider]
})
export class TenantModule {
    static forRoot(): DynamicModule {
        return {
            module: TenantModule,
            providers: [
                {
                    provide: CONNECTION,
                    scope: Scope.REQUEST,
                    useFactory: async ({ req }) => {
                        const hostHeader = req.hostname;
                        const host = hostHeader.split('.');
                        const subdomain = host[0];
                        const connectionProvider = new ConnectionProvider();
                        return connectionProvider.getTenantConnection(subdomain);
                    },
                    inject: [REQUEST],
                },
                ConnectionProvider,  // Provide the ConnectionProvider for potential reuse
            ],
            exports: [CONNECTION]
        };
    }
}