import { Resolver, Args, Query, Mutation, Int } from '@nestjs/graphql';
import { User } from '../models/user.model';
import { UserService } from '../providers/user.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { UserUpdatePasswordInput } from '../dto/user-update-password.dto';
import { UserConnectionDto } from '../dto/user-connection.model';
import { UserFilter } from '../dto/user.filter';
import { PaginationArgs } from 'src/shared/pagination/types/pagination.args';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';

@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UserResolver {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Query(() => UserConnectionDto, { deprecationReason: "Replaced with `users` query" })
    getUsers(
        @Args() paginationArgs: PaginationArgs,
        @Args() userFilter: UserFilter,
    ): Promise<UserConnectionDto> {
        return this.userService.list(paginationArgs, userFilter);
    }

    @Query(() => User, { deprecationReason: "Replaced with `user` query" })
    getUser(
        @Args('id') userId: number,
    ): Promise<User> {
        return this.userService.getOne(userId);
    }

    @Mutation(() => User, { deprecationReason: "Replaced with `createOneUser` mutation" })
    createUser(
        @Args('input') userInput: CreateUserInput,
    ): Promise<User> {
        return this.userService.createUser(userInput);
    }

    @Mutation(() => User, { deprecationReason: "Replaced with `updateOneUser` mutation" })
    updateUser(
        @Args({ name: 'id', type: () => Int }) userId: number,
        @Args('input') userInputData: UpdateUserInput,
    ): Promise<User> {
        return this.userService.updateUser(userId, userInputData);
    }

    @Mutation(() => Boolean, { deprecationReason: "Replaced with `deleteOneUser` mutation" })
    deleteUser(
        @Args('id') id: number,
    ): Promise<boolean> {
        return this.userService.deleteUser(id);
    }

    @Mutation(() => Boolean)
    updateUserPassword(
        @Args({ name: 'id', type: () => Int }) targetUserId: number,
        @Args('input') updatePasswordInput: UserUpdatePasswordInput,
    ): Promise<boolean> {
        return this.userService.changePassword(updatePasswordInput, targetUserId, true);
    }
}
