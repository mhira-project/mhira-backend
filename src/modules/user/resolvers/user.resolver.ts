import { Resolver, Args, Query, Mutation, ResolveField, Parent, Int } from '@nestjs/graphql';
import { User } from '../models/user.model';
import { UserService } from '../providers/user.service';
import { UserUpdateInput } from '../dto/user-update.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { UserUpdatePasswordInput } from '../dto/user-update-password.dto';
import { UserInput } from '../dto/user.input';
import { PaginatedUser } from '../dto/paginated-user.model';
import { UserFilter } from '../dto/user.filter';
import { PaginationArgs } from 'src/shared/pagination/types/pagination.args';

@UseGuards(GqlAuthGuard)
@Resolver(() => User)
export class UserResolver {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Query(() => PaginatedUser)
    getUsers(
        @Args() paginationArgs: PaginationArgs,
        @Args() userFilter: UserFilter,
        @CurrentUser() viewer,
    ): Promise<PaginatedUser> {
        return this.userService.getOwnInstitutionUsers(paginationArgs, userFilter, viewer);
    }

    @Mutation(() => User)
    createUser(
        @Args('input') userInput: UserInput,
    ): Promise<User> {
        return this.userService.createOwnInstitutionUser(userInput);
    }

    @Mutation(() => User)
    updateUser(
        @Args({ name: 'id', type: () => Int }) userId: number,
        @Args('input') userInputData: UserUpdateInput,
        @CurrentUser() currentUser: User,
    ): Promise<User> {
        return this.userService.updateOwnInstitutionUser(userId, userInputData, currentUser);
    }

    @Mutation(() => Boolean)
    deleteUser(
        @Args('id') id: number,
        @CurrentUser() currentUser: User,
    ): Promise<boolean> {
        return this.userService.deleteOwnInstitutionUser(id, currentUser);
    }

    @Mutation(() => Boolean)
    updateUserPassword(
        @Args({ name: 'id', type: () => Int }) targetUserId: number,
        @Args('input') updatePasswordInput: UserUpdatePasswordInput,
        @CurrentUser() currentUser: User,
    ): Promise<boolean> {
        return this.userService.changeOwnInstitutionUserPassword(updatePasswordInput, targetUserId, currentUser);
    }
}
