import { SortDirection } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
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
import { DeleteOneRoleInput } from '../dtos/delete-one-role.input';
import { RoleInput } from '../dtos/role.input';
import { UpdateOneRoleInput } from '../dtos/update-one-role.input';
import { RoleCrudService } from '../providers/role-crud.service';
import { UseOrPermissions } from '../decorators/permission.decorator';
import {
    AddPermissionsToRoleInput,
    RemovePermissionsFromRoleInput,
} from '../dtos/update-role-permissions.input';
import { Permission } from '../models/permission.model';
import { In } from 'typeorm';
import { PermissionAction } from '../enums/permission-action.enum';

@Resolver(() => Role)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class RoleResolver extends CRUDResolver(Role, {
    CreateDTOClass: RoleInput,
    UpdateDTOClass: RoleInput,
    read: {
        defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
        decorators: [
            UseOrPermissions([
                PermissionEnum.VIEW_ROLES_PERMISSIONS,
                PermissionEnum.MANAGE_ROLES_PERMISSIONS,
                PermissionEnum.VIEW_USERS,
                PermissionEnum.MANAGE_USERS,
            ]),
        ],
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
        @Args('input', { type: () => CreateOneRoleInput })
        input: CreateOneRoleInput,
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
        });
        const currentUserMaxRole = currentUser.roles.reduce((prev, current) => {
            return prev.hierarchy > current.hierarchy ? prev : current;
        });

        if (roleInput.hierarchy <= currentUserMaxRole.hierarchy) {
            throw new BadRequestException(
                'Cannot create role with higher hierarchy than your own. ' +
                    `Please provide hierarchy number greater than ${currentUserMaxRole.hierarchy}`,
            );
        }

        return this.service.createOne(input['role']);
    }

    @Mutation(() => Role)
    @UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)
    async updateOneRole(
        @Args('input', { type: () => UpdateOneRoleInput })
        input: UpdateOneRoleInput,
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
                throw new BadRequestException(
                    'Role with same name already exists',
                );
            }
        }

        return this.service.updateOne(id, update);
    }

    @Mutation(() => Role)
    @UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)
    async deleteOneRole(
        @Args('input', { type: () => DeleteOneRoleInput })
        input: DeleteOneRoleInput,
        @CurrentUser() currentUser: User,
    ): Promise<Role> {
        const { id } = input;

        // Reload current Role with roles
        await this.canUpdateRole(id as number, currentUser);

        return this.service.deleteOne(id);
    }

    @Mutation(() => Role)
    @UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)
    async removePermissionsFromRole(
        @Args('input', { type: () => RemovePermissionsFromRoleInput })
        input: RemovePermissionsFromRoleInput,
        @CurrentUser() currentUser: User,
    ) {
        const { role } = await this.canUpdatePermissions(
            input,
            currentUser,
            PermissionAction.REMOVE,
        );

        role.permissions = role.permissions.filter(
            permission => !input.relationIds.includes(permission.id),
        );

        return role.save();
    }

    @Mutation(() => Role)
    @UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)
    async addPermissionsToRole(
        @Args('input', { type: () => AddPermissionsToRoleInput })
        input: AddPermissionsToRoleInput,
        @CurrentUser() currentUser: User,
    ) {
        const { role, permissions } = await this.canUpdatePermissions(
            input,
            currentUser,
            PermissionAction.ADD,
        );

        role.permissions.push(...permissions);

        return role.save();
    }

    private async canUpdatePermissions(
        input: AddPermissionsToRoleInput,
        currentUser: User,
        action: PermissionAction,
    ): Promise<{ role: Role; permissions: Permission[] }> {
        const role = await Role.findOneOrFail({
            where: { id: input.id },
            relations: ['permissions'],
        });

        currentUser = await User.findOne({
            where: { id: currentUser.id },
            relations: ['roles', 'roles.permissions'],
        });

        let errorMessage = '';

        const isOwnRole = currentUser.roles.some(role => role.id === input.id);
        const hasHigherHierarchy = currentUser.roles.some(
            userRole => userRole.hierarchy < role.hierarchy,
        );
        const hasPermission = currentUser.roles.some(userRole =>
            userRole.permissions.some(permission =>
                input.relationIds.includes(permission.id),
            ),
        );

        if (isOwnRole) {
            errorMessage = 'You cannot modify your own permissions.';
        } else if (!hasHigherHierarchy) {
            errorMessage = 'Your hierarchy is not high enough.';
        } else if (!hasPermission) {
            errorMessage =
                'You cannot modify permissions that you do not have yourself.';
        }

        const permissions = await Permission.find({
            where: { id: In(input.relationIds) },
        });

        const permissionNames = permissions
            .map(permission => permission.name)
            .join(', ');

        if (!!errorMessage) {
            throw new BadRequestException(
                `Cannot ${action} permission [${permissionNames}] to role [${role.name}]. ${errorMessage}`,
            );
        }

        return { role, permissions };
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
    private async canUpdateRole(
        roleId: number,
        currentUser: User,
        update?: RoleInput,
    ): Promise<void> {
        const roleInDb = await Role.findOneOrFail({
            where: { id: roleId },
        });

        // reload current user with roles
        currentUser = await User.findOne({
            where: { id: currentUser.id },
            relations: ['roles'],
        });
        const currentUserMaxRole = currentUser.roles.reduce((prev, current) => {
            return prev.hierarchy > current.hierarchy ? prev : current;
        });

        if (roleInDb.hierarchy <= currentUserMaxRole.hierarchy) {
            throw new BadRequestException(
                'Permission denied! Cannot modify role with a higher hierarchy than your own. ' +
                    `Please provide hierarchy number greater than ${currentUserMaxRole.hierarchy}`,
            );
        }

        if (update && update.hierarchy <= currentUserMaxRole.hierarchy) {
            throw new BadRequestException(
                'Permission denied! Cannot modify role to a higher hierarchy than your own. ' +
                    `Please provide hierarchy number greater than ${currentUserMaxRole.hierarchy}`,
            );
        }
    }
}
