import { Global, Inject, Injectable, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getTenantConnection } from './tenancy.utils';
import { Request } from 'express';

import { CONNECTION } from './tenancy.symbols';

// update request object to include subdomain
declare global {
    namespace Express {
        interface Request {
            subdomain: string;
        }
    }
}

@Injectable({ scope: Scope.REQUEST })
export class ConnectionFactory {
    constructor(@Inject(REQUEST) private readonly request: Request) { }

    getConnection() {
        if (!this.request) {
            throw new Error('Req obj is undefined');
        }
        const subdomain = this.request.subdomain;
        if (subdomain) {
            return getTenantConnection(subdomain);
        }

        return null;
    }
}


export const connectionFactory = {
    provide: CONNECTION,
    useFactory: (factory: ConnectionFactory) => factory.getConnection(),
    inject: [ConnectionFactory, REQUEST],
};

@Global()
@Module({
    providers: [connectionFactory, ConnectionFactory],
    exports: [CONNECTION],
})
export class TenancyModule { }