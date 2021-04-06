import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../models/role.model';

@QueryService(Role)
export class RoleCrudService extends TypeOrmQueryService<Role> {
    constructor(@InjectRepository(Role) repo: Repository<Role>) {
        // pass the use soft delete option to the service.
        super(repo, { useSoftDelete: true });
    }
}
