import { UpdateManyResponse, Filter, SortDirection } from '@nestjs-query/core';
import {
    CRUDResolver,
    FilterType,
    UpdateManyResponseType,
} from '@nestjs-query/query-graphql';
import { UseGuards } from '@nestjs/common';
import {
    Resolver,
    Args,
    Mutation,
    ID,
    ResolveField,
    Parent,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
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
        decorators: [UsePermission(PermissionEnum.VIEW_USERS)],
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
    async createOneUser(
        @Args('input', { type: () => CreateOneUserInput })
        input: CreateOneUserInput,
    ): Promise<User> {
        // delegate further actions to service
        return this.service.createOne(input['user']);
    }

    @Mutation(() => User)
    @UsePermission(PermissionEnum.MANAGE_USERS)
    async updateOneUser(
        @Args('input', { type: () => UpdateOneUserInput })
        input: UpdateOneUserInput,
        @CurrentUser() currentUser: User,
    ): Promise<User> {
        const { id, update } = input;

        // Delegate further actions to service
        return this.service.updateOneUser(Number(id), update, currentUser);
    }

    @Mutation(() => User)
    async updateUserAcceptedTerm(
        @Args('input', { type: () => UpdateOneUserInput })
        input: UpdateOneUserInput,
    ): Promise<User> {
        const { id, update } = input;

        // Delegate further actions to service
        return this.service.updateUserAcceptedTerm(Number(id), update);
    }

    @Mutation(() => Boolean)
    @UsePermission(PermissionEnum.MANAGE_USERS)
    async deleteOneUser(
        @Args('input', { type: () => DeleteOneUserInput })
        input: DeleteOneUserInput,
        @CurrentUser() currentUser: User,
    ): Promise<boolean> {
        const { id } = input;

        // Delegate further actions to service
        return this.service.deleteOneUser(Number(id), currentUser);
    }

    // restore one mutation will update the `deletedAt` column to null.
    @Mutation(() => User)
    @UsePermission(PermissionEnum.MANAGE_USERS)
    restoreOneUser(
        @Args('input', { type: () => ID }) id: number,
    ): Promise<User> {
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
    @ResolveField(() => [Permission], {
        description: 'Get User Permission Grants. ',
    })
    @UseGuards(GqlAuthGuard)
    permissionGrants(@Parent() user: User): Promise<Permission[]> {
        return PermissionService.userPermissionGrants(user.id);
    }
}
