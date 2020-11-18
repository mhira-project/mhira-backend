import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.model';
import * as moment from 'moment';

@QueryService(User)
export class UserCrudService extends TypeOrmQueryService<User> {
    constructor(@InjectRepository(User) repo: Repository<User>) {
        // pass the use soft delete option to the service.
        super(repo, { useSoftDelete: true });
    }

    passwordChangeRequired(user: User): boolean {

        const required = user.passwordExpiresAt
            ? moment().isSameOrAfter(user.passwordExpiresAt)
            : true;

        return required;
    }
}
