import { UpdateManyResponse, Filter, SortDirection } from '@nestjs-query/core';
import { CRUDResolver, FilterType, UpdateManyResponseType } from '@nestjs-query/query-graphql';
import { BadRequestException } from '@nestjs/common';
import { Resolver, Args, Mutation, ID, ResolveField, Parent } from '@nestjs/graphql';
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
        user.roles = [noRole];
        await user.save();

        return user;
    }

    @Mutation(() => User)
    async updateOneUser(@Args('input', { type: () => UpdateOneUserInput }) input: UpdateOneUserInput): Promise<User> {

        const { id, update } = input;

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
