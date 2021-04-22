import { UpdateManyResponse, Filter, SortDirection } from '@nestjs-query/core';
import { CRUDResolver, FilterType, UpdateManyResponseType } from '@nestjs-query/query-graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { Resolver, Args, Mutation, ID, ResolveField, Parent } from '@nestjs/graphql';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { RoleCode } from 'src/modules/permission/enums/role-code.enum';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { Role } from 'src/modules/permission/models/role.model';
import { CreateOneUserInput } from '../dto/create-one-user.input';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateOneUserInput } from '../dto/update-one-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User } from '../models/user.model';
import { UserCrudService } from '../providers/user-crud.service';
import { PermissionService } from '../../permission/providers/permission.service';
import { Permission } from 'src/modules/permission/models/permission.model';
import { DeleteOneUserInput } from '../dto/delete-one-user.input';

@Resolver(() => User)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class UserCrudResolver extends CRUDResolver(User, {
    CreateDTOClass: CreateUserInput,
    UpdateDTOClass: UpdateUserInput,
    read: {
        defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
        decorators: [UsePermission(PermissionEnum.VIEW_USERS)]
    },
    create: { disabled: true },
    update: { disabled: true },
    delete: { disabled: true },
}) {
    constructor(readonly service: UserCrudService) {
        super(service);
    }

    @Mutation(() => User)
    @UsePermission(PermissionEnum.MANAGE_USERS)
    async createOneUser(@Args('input', { type: () => CreateOneUserInput }) input: CreateOneUserInput): Promise<User> {

        const exists = await User.findOne({ username: input['user'].username });

        if (exists) {
            throw new BadRequestException('Username already exists');
        }

        const user = await this.service.createOne(input['user']);

        // attach no-role Role
        const noRole = await Role.findOne({ code: RoleCode.NO_ROLE });
        if (noRole) {
            user.roles = [noRole];
            await user.save();
        }


        return user;
    }

    @Mutation(() => User)
    @UsePermission(PermissionEnum.MANAGE_USERS)
    async updateOneUser(
        @Args('input', { type: () => UpdateOneUserInput }) input: UpdateOneUserInput,
        @CurrentUser() currentUser: User,
    ): Promise<User> {

        const { id, update } = input;

        if (!await PermissionService.compareHierarchy(currentUser.id, +id)) {
            throw new BadRequestException('Permission denied to modify user! User has higher or equal role than current user');
        }

        if (!!update.username) {
            const exists = await User.createQueryBuilder()
                .where('username = :username AND id <> :id', { username: update.username, id })
                .getOne();

            if (exists) {
                throw new BadRequestException('Username already exists');
            }
        }

        return this.service.updateOne(id, update);
    }

    @Mutation(() => User)
    @UsePermission(PermissionEnum.MANAGE_USERS)
    async deleteOneUser(
        @Args('input', { type: () => DeleteOneUserInput }) input: DeleteOneUserInput,
        @CurrentUser() currentUser: User,
    ): Promise<User> {

        const { id } = input;

        if (!await PermissionService.compareHierarchy(currentUser.id, +id)) {
            throw new BadRequestException('Permission denied to delete user! User has higher or equal role than current user');
        }

        return this.service.deleteOne(id);
    }

    // restore one mutation will update the `deletedAt` column to null.
    @Mutation(() => User)
    @UsePermission(PermissionEnum.MANAGE_USERS)
    restoreOneUser(@Args('input', { type: () => ID }) id: number): Promise<User> {
        return this.service.restoreOne(id);
    }

    // restore many mutation will update the `deletedAt` column to null for all todo items that
    // match the filter.
    @Mutation(() => UpdateManyResponseType())
    @UsePermission(PermissionEnum.MANAGE_USERS)
    restoreManyUsers(
        @Args('input', { type: () => FilterType(User) }) filter: Filter<User>,
    ): Promise<UpdateManyResponse> {
        return this.service.restoreMany(filter);
    }

    @ResolveField(() => Boolean)
    passwordChangeRequired(@Parent() user: User) {

        return this.service.passwordChangeRequired(user);
    }

    // permission grants
    @ResolveField(() => [Permission], { description: 'Get User Permission Grants. ' })
    @UseGuards(GqlAuthGuard)
    permissionGrants(@Parent() user: User): Promise<Permission[]> {

        return PermissionService.userPermissionGrants(user.id);
    }
}
