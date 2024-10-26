import { Controller, Get, Post, Put, Body, Param, Inject } from '@nestjs/common';
import { CreateTenantDto } from '../dtos/tenant.input';
import { TenantService } from '../providers/tenants.service';
import { Tenant } from '../models/tenant.model';

@Controller('tenant')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    createTenant(@Body() newTenant: CreateTenantDto): Promise<Tenant> {
        return this.tenantService.createTenant(newTenant);
    }

    @Get()
    getTenants(): Promise<Tenant[]> {
        return this.tenantService.getTenants();
    }
}