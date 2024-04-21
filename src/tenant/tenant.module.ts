import {
  BadRequestException,
  Global,
  Inject,
  Injectable,
  MiddlewareConsumer,
  Module,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tenant } from './tenant.entity';
import { Connection, createConnection, getConnection, getConnectionManager } from 'typeorm';

export const CONNECTION = 'CONNECTION';

async function getTenantConnection(
connectionName: string,
): Promise<Connection> {
const connectionManager = getConnectionManager()

console.log('connectionManager', connectionManager)
// cache hit
if (connectionManager.has(connectionName)) {
  const conn = connectionManager.get(connectionName)

  return conn.isConnected ? conn : conn.connect()
}

try {
  const conn = await createConnection(
    {
        name: connectionName,
        type: process.env.TYPEORM_CONNECTION as 'postgres',
        host: process.env.TYPEORM_HOST,
        port: parseInt(process.env.TYPEORM_PORT, 10),
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: connectionName,
        entities: [
            __dirname + process.env.TYPEORM_ENTITIES_DIR,
        ],
        synchronize:
            process.env.TYPEORM_SYNCHRONIZE === 'true',
    },
);

  return conn
} catch (err) {
  throw new NotFoundException('project id is not found')
}
}


const connectionFactory = {
provide: CONNECTION, // is a symbol
scope: Scope.REQUEST,
useFactory: async ({ req }) => {

    const hostHeader = req.host;
    const host = hostHeader.split('.');
    const subdomain = host[0];

    const dbName = `${subdomain}_db`;

    if (dbName) {
      return getTenantConnection(dbName);
    }

    return null
  },
  inject: [REQUEST],
}

@Global()
@Module({
  providers: [connectionFactory],
  exports: [CONNECTION],
})


export class TenantModule {}


