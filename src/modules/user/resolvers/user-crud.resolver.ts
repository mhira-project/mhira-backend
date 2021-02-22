import { UpdateManyResponse, Filter, SortDirection } from '@nestjs-query/core';
import { CRUDResolver, FilterType, UpdateManyResponseType } from '@nestjs-query/query-graphql';
import { BadRequestException } from '@nestjs/common';
import { Resolver, Args, Mutation, ID, ResolveField, Parent } from '@nestjs/graphql';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { RoleCode } from 'src/modules/permission/enums/role-code.enum';
import { Role } from 'src/modules/permission/models/role.model';
import { CreateOneUserInput } from '../dto/create-one-user.input';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateOneUserInput } from '../dto/update-one-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User } from '../models/user.model';
import { UserCrudService } from '../providers/user-crud.service';

@Resolver(() => User)
export class UserCrudResolver extends CRUDResolver(User, {
    CreateDTOClass: CreateUserInput,
    UpdateDTOClass: UpdateUserInput,
    read: { defaultSort: [{ field: 'id', direction: SortDirection.DESC }] },
    create: { disabled: true }
}) {
    constructor(readonly service: UserCrudService) {
        super(service);
    }

    @Mutation(() => User)
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
    async updateOneUser(
        @Args('input', { type: () => UpdateOneUserInput }) input: UpdateOneUserInput,
        @CurrentUser() currentUser: User,
    ): Promise<User> {

        const { id, update } = input;

        // Reload current user with roles
        currentUser = await User.findOneOrFail({
            where: { id: currentUser.id },
            relations: ['roles'],
        });

        // Load targetUser with roles
        const targetUser = await User.findOneOrFail({
            where: { id },
            relations: ['roles'],
        });

        const currentUserMaxRole = currentUser.roles.reduce((prev, current) => {
            return (prev.heirarchy > current.heirarchy) ? prev : current
        });

        const targetUserMaxRole = targetUser.roles.reduce((prev, current) => {
            return (prev.heirarchy > current.heirarchy) ? prev : current
        });

        if (currentUserMaxRole.heirarchy <= targetUserMaxRole.heirarchy) {
            throw new BadRequestException('Permission denied to modify user! User has higher role than current user');
        }

        if (!!update.username) {
            const exists = await User.createQueryBuilder()
                .where('username = :username AND id <> :id', { username: update.username, id })
                .getOne()

            if (exists) {
                throw new BadRequestException('Username already exists');
            }
        }

        return this.service.updateOne(id, update);
    }

    // restore one mutation will update the `deletedAt` column to null.
    @Mutation(() => User)
    restoreOneUser(@Args('input', { type: () => ID }) id: number): Promise<User> {
        return this.service.restoreOne(id);
    }

    // restore many mutation will update the `deletedAt` column to null for all todo items that
    // match the filter.
    @Mutation(() => UpdateManyResponseType())
    restoreManyUsers(
        @Args('input', { type: () => FilterType(User) }) filter: Filter<User>,
    ): Promise<UpdateManyResponse> {
        return this.service.restoreMany(filter);
    }

    @ResolveField(() => Boolean)
    passwordChangeRequired(@Parent() user: User) {

        return this.service.passwordChangeRequired(user);
    }
}
