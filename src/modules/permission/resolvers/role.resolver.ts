import { SortDirection } from '@nestjs-query/core';
import { CRUDResolver, DeleteOneInputType } from '@nestjs-query/query-graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { Role } from 'src/modules/permission/models/role.model';
import { User } from 'src/modules/user/models/user.model';
import { CreateOneRoleInput } from '../dtos/create-one-role.input';
import { RoleInput } from '../dtos/role.input';
import { UpdateOneRoleInput } from '../dtos/update-one-role.input';
import { RoleCrudService } from '../providers/role-crud.service';

@Resolver(() => Role)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class RoleResolver extends CRUDResolver(Role, {
    CreateDTOClass: RoleInput,
    UpdateDTOClass: RoleInput,
    read: {
        defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
        decorators: [UsePermission(PermissionEnum.VIEW_ROLES_PERMISSIONS)]
    },
    create: { disabled: true }, // overriden with custom implementation
    update: { disabled: true }, // overriden with custom implementation
    delete: { disabled: true }, // overriden with custom implementation
}) {
    constructor(readonly service: RoleCrudService) {
        super(service);
    }

    @Mutation(() => Role)
    @UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)
    async createOneRole(
        @Args('input', { type: () => CreateOneRoleInput }) input: CreateOneRoleInput,
        @CurrentUser() currentUser: User,
    ): Promise<Role> {

        const roleInput = input['role'] as RoleInput;

        const exists = await Role.findOne({ name: roleInput.name });

        if (exists) {
            throw new BadRequestException('Role with same name already exists');
        }

        // reload current user with roles
        currentUser = await User.findOne({
            where: { id: currentUser.id },
            relations: ['roles'],
        })
        const currentUserMaxRole = currentUser.roles.reduce((prev, current) => {
            return (prev.hierarchy > current.hierarchy) ? prev : current
        });

        if (roleInput.hierarchy <= currentUserMaxRole.hierarchy) {
            throw new BadRequestException('Cannot create role with higher hierarchy than your own. '
                + `Please provide hierarchy number greater than ${currentUserMaxRole.hierarchy}`);
        }

        const role = await this.service.createOne(input['role']);

        return role;
    }

    @Mutation(() => Role)
    @UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)
    async updateOneRole(
        @Args('input', { type: () => UpdateOneRoleInput }) input: UpdateOneRoleInput,
        @CurrentUser() currentUser: User,
    ): Promise<Role> {

        const { id, update } = input;

        // Reload current Role with roles
        await this.canUpdateRole(id as number, currentUser, update);

        if (!!update.name) {
            const exists = await Role.createQueryBuilder()
                .where('name = :name AND id <> :id', { name: update.name, id })
                .getOne();

            if (exists) {
                throw new BadRequestException('Role with same name already exists');
            }
        }

        return this.service.updateOne(id, update);
    }

    @Mutation(() => Role)
    @UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)
    async deleteOneRole(
        @Args('input', { type: () => DeleteOneInputType }) input: DeleteOneInputType,
        @CurrentUser() currentUser: User,
    ): Promise<Role> {

        const { id } = input;

        // Reload current Role with roles
        await this.canUpdateRole(id as number, currentUser);

        return this.service.deleteOne(id);
    }


    /**
     * Checks if current user can update/delete the Role.
     * Throws a BadRequest exception incase of 
     * insufficient previledges.
     * 
     * @param roleId 
     * @param currentUser 
     * @param update 
     */
    private async canUpdateRole(roleId: number, currentUser: User, update?: RoleInput): Promise<void> {
        const roleInDb = await Role.findOneOrFail({
            where: { id: roleId },
        });

        // reload current user with roles
        currentUser = await User.findOne({
            where: { id: currentUser.id },
            relations: ['roles'],
        });
        const currentUserMaxRole = currentUser.roles.reduce((prev, current) => {
            return (prev.hierarchy > current.hierarchy) ? prev : current;
        });

        if (roleInDb.hierarchy <= currentUserMaxRole.hierarchy) {
            throw new BadRequestException('Permission denied! Cannot modify role with a higher hierarchy than your own. '
                + `Please provide hierarchy number greater than ${currentUserMaxRole.hierarchy}`);
        }

        if (update && (update.hierarchy <= currentUserMaxRole.hierarchy)) {
            throw new BadRequestException('Permission denied! Cannot modify role to a higher hierarchy than your own. '
                + `Please provide hierarchy number greater than ${currentUserMaxRole.hierarchy}`);
        }
    }
}
