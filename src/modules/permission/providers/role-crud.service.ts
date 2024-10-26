import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Connection } from 'typeorm';
import { Role } from '../models/role.model';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbols';
import { Inject } from '@nestjs/common';

@QueryService(Role)
export class RoleCrudService extends TypeOrmQueryService<Role> {
    constructor(@Inject(CONNECTION) private readonly connection: Connection) {
        // pass the use soft delete option to the service.
        super(connection.getRepository(Role), { useSoftDelete: true });
    }
}
