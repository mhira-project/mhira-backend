import { UpdateManyResponse, Filter, SortDirection } from '@nestjs-query/core';
import { CreateOneInputType, CRUDResolver, FilterType, UpdateManyResponseType } from '@nestjs-query/query-graphql';
import { BadRequestException } from '@nestjs/common';
import { Resolver, Args, Mutation, ID, ResolveField, Parent, InputType } from '@nestjs/graphql';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import { User } from '../models/user.model';
import { UserCrudService } from '../providers/user-crud.service';

@InputType()
export class CreateOneUserInput extends
    CreateOneInputType('user', CreateUserInput) {

}
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

    // // restore one mutation will update the `deletedAt` column to null.
    @Mutation(() => User)
    async createOneUser(@Args('input', { type: () => CreateOneUserInput }) input: CreateOneUserInput): Promise<User> {

        const exists = await User.findOne({ username: input['user'].username });

        if (exists) {
            throw new BadRequestException('Username already taken');
        }

        return this.service.createOne(input['user']);
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
