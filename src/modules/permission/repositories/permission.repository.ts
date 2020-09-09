import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Permission } from '../models/permission.model';

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {

    private logger = new Logger('PermissionRepository');

}
