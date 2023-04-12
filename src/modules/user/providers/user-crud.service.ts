import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.model';
import * as moment from 'moment';
import { CreateUserInput } from '../dto/create-user.input';
import { BadRequestException } from '@nestjs/common';
import { Role } from 'src/modules/permission/models/role.model';
import { RoleCode } from 'src/modules/permission/enums/role-code.enum';
import { UpdateUserInput } from '../dto/update-user.input';
import { PermissionService } from 'src/modules/permission/providers/permission.service';
import {Hash} from "../../../shared";

@QueryService(User)
export class UserCrudService extends TypeOrmQueryService<User> {
    constructor(@InjectRepository(User) repo: Repository<User>) {
        // pass the use soft delete option to the service.
        super(repo);
    }

    async createOne(input: CreateUserInput): Promise<User> {
        // Check duplicate username exists
        const exists = await super.query({
            filter: { username: { iLike: input.username } }, // case in-sensitive match username
        });

        if (exists.length > 0) {
            throw new BadRequestException('Username already exists');
        }

        const user = await super.createOne(input);

        user.passwordExpiresAt = moment().toDate();
        user.password = await Hash.make(user.password);

        const defaultRole = await Role.findOne({ code: RoleCode.NO_ROLE });

        if (defaultRole) {
            user.roles = [defaultRole];
            await user.save();
        }

        return user;
    }

    async updateOneUser(
        id: number,
        update: UpdateUserInput,
        currentUser: User,
    ): Promise<User> {
        // Validate permission hierachy
        if (!(await PermissionService.compareHierarchy(currentUser.id, +id))) {
            throw new BadRequestException(
                'Permission denied to modify user! User has higher or equal role than current user',
            );
        }

        // Check for duplicate username
        if (!!update.username) {
            const [exists] = await super.query({
                filter: {
                    and: [
                        { username: { iLike: update.username } }, // case in-sensitive match username
                        { id: { neq: Number(id) } }, // exclude current row from duplicate check
                    ],
                },
            });

            if (exists) {
                throw new BadRequestException('Username already exists');
            }
        }

        return super.updateOne(id, update);
    }

    async updateUserAcceptedTerm(
        id: number,
        update: UpdateUserInput,
    ): Promise<User> {
        // Check for duplicate username
        update = { acceptedTerm: update.acceptedTerm };

        return super.updateOne(id, update);
    }

    async deleteOneUser(id: number, currentUser: User): Promise<boolean> {
        if (!(await PermissionService.compareHierarchy(currentUser.id, +id))) {
            throw new BadRequestException(
                'Permission denied to delete user! User has higher or equal role than current user',
            );
        }

        const user = await super.deleteOne(id)
        return !!user;
    }

    passwordChangeRequired(user: User): boolean {
        return user.passwordExpiresAt
            ? moment().isSameOrAfter(user.passwordExpiresAt)
            : true;
    }
}
