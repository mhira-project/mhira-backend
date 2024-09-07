import { Connection, createConnection, getConnectionManager } from 'typeorm';

export function getTenantConnection(tenantId: string): Promise<Connection> {
    const connectionName = tenantId;
    const connectionManager = getConnectionManager();
    if (connectionManager.has(connectionName)) {
        const connection = connectionManager.get(connectionName);
        return Promise.resolve(connection.isConnected ? connection : connection.connect());
    }

    return createConnection({
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
    });
}