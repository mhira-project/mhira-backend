import { Controller, Get, Post, Put, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { CreateTenantDto } from '../dtos/tenant.input';
import { TenantService } from '../providers/tenants.service';
import { Tenant } from '../models/tenant.model';
import { AuthGuard } from '@nestjs/passport';

@Controller('tenant')
@UseGuards(AuthGuard('basic'))
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    createTenant(@Body() newTenant: CreateTenantDto): Promise<Tenant> {
        return this.tenantService.createTenant(newTenant);
    }

    @Post()
    deleteTenant(@Param('id') id: string): Promise<void> {
        return this.tenantService.deleteTenant(id);
    }

    @Get()
    getTenants(): Promise<Tenant[]> {
        return this.tenantService.getTenants();
    }
}