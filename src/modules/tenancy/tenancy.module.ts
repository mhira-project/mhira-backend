import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getTenantConnection } from './tenancy.utils';

import { CONNECTION } from './tenancy.symbols';
import { TenantService } from './providers/tenants.service';
import { Tenant } from './models/tenant.model';
import { TypeOrmModule } from '@nestjs/typeorm';


const connectionFactory = {
    provide: CONNECTION,
    scope: Scope.REQUEST,
    useFactory: (request: any) => {
        const { subdomain } = request.req;

        if (!subdomain) {
            throw new Error('Tenant not found');
        }

        return getTenantConnection(subdomain);
    },
    inject: [REQUEST],
};

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Tenant])],
    providers: [connectionFactory, TenantService],
    exports: [CONNECTION, TenantService],
    controllers: [],
})
export class TenancyModule { }