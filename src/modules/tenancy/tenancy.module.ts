import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getTenantConnection } from './tenancy.utils';

import { CONNECTION } from './tenancy.symbols';


const connectionFactory = {
    provide: CONNECTION,
    scope: Scope.REQUEST,
    useFactory: (request: any) => {
        const { subdomain } = request.req;

        if (!subdomain) {
            throw new Error('Subdomain not found');
        }

        return getTenantConnection(subdomain);
    },
    inject: [REQUEST],
};

@Global()
@Module({
    providers: [connectionFactory],
    exports: [CONNECTION],
})
export class TenancyModule { }