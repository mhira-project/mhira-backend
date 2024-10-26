import { configService } from 'src/config/config.service';
import { Connection, createConnection, getConnection, getConnectionManager, Repository } from 'typeorm';
import { Tenant } from './models/tenant.model';

export function getTenantConnection(tenantId: string): Promise<Connection> {
    const connectionName = tenantId;
    const connectionManager = getConnectionManager();
    if (connectionManager.has(connectionName)) {
        const connection = connectionManager.get(connectionName);
        return Promise.resolve(connection.isConnected ? connection : connection.connect());
    }

    return createConnection({
        ...configService.getTypeOrmConfigTenants(),
        name: connectionName,
        schema: connectionName,
    });
}

export async function runTenantsMigration() {
    const tenants = await Tenant.find();

    await Promise.all(tenants.map(async tenant => {
        const connection = await getTenantConnection(tenant.subdomain);
        await connection.runMigrations();
        await connection.close();
    }));
}

export async function runMainMigrations() {
    await getConnection().runMigrations();
}

export async function runMigrations() {
    await runMainMigrations();
    await runTenantsMigration();
}