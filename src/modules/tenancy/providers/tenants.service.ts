import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tenant } from "../models/tenant.model";
import { getManager, MigrationExecutor, QueryFailedError, Repository } from "typeorm";
import { CreateTenantDto } from "../dtos/tenant.input";
import { getTenantConnection } from "../tenancy.utils";
import { PermissionService } from "src/modules/permission/providers/permission.service";

@Injectable()
export class TenantService {

    constructor(@InjectRepository(Tenant) private tenantRepository: Repository<Tenant>) {

    }

    async createTenant(createTenantDto: CreateTenantDto) {
        try {
            const tenantInput = this.tenantRepository.create(createTenantDto);
            const tenant = await this.tenantRepository.save(tenantInput);

            const schemaName = createTenantDto.subdomain;
            await getManager().query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

            const connection = await getTenantConnection(schemaName);

            await connection.runMigrations();

            const permissionService = new PermissionService(connection);
            await permissionService.populatePermissionsInDB();

            await connection.close();

            return tenant;
        } catch (error) {
            if (error instanceof QueryFailedError && error.message.includes('duplicate key value')) {
                throw new ConflictException('Tenant already exists');
            }
            throw error;
        }
    }

    async deleteTenant(id: string) {
        const tenant = await this.getTenantById(id);

        if (!tenant) {
            throw new BadRequestException('Tenant not found');
        }

        await this.tenantRepository.delete(id);

        await getManager().query(`DROP SCHEMA IF EXISTS ${tenant.subdomain} CASCADE`);
    }

    async getTenantById(id: string) {
        return this.tenantRepository.findOne(id);
    }

    async getTenantBySubdomain(subdomain: string) {
        return this.tenantRepository.findOne({ where: { subdomain } });
    }

    async getTenants() {
        return this.tenantRepository.find();
    }
}