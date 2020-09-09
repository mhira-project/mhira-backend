import { Resolver, Args, Query, Mutation, ResolveField, Parent, Int } from '@nestjs/graphql';
import { User } from '../models/institution-user.model';
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
import { Institution } from 'src/modules/institution/models/institution.model';
import { InstitutionLoader } from 'src/modules/institution/dataloaders/institution.loader';
import { UserTypeGuard } from 'src/modules/permission/guards/user-type.guard';
import { AllowUserType } from 'src/modules/permission/decorators/user-type.decorator';
import { UserType } from '../models/user-type.enum';
import { BaseUser } from '../models/base-user.model';

@UseGuards(GqlAuthGuard, UserTypeGuard)
@AllowUserType(UserType.USER)
@Resolver(() => User)
export class UserResolver {
    constructor(
        private readonly userService: UserService,
        private readonly institutionLoader: InstitutionLoader,
    ) { }

    @Query(() => PaginatedUser)
    getOwnInstitutionUsers(
        @Args() paginationArgs: PaginationArgs,
        @Args() userFilter: UserFilter,
        @CurrentUser() viewer,
    ): Promise<PaginatedUser> {
        return this.userService.getOwnInstitutionUsers(paginationArgs, userFilter, viewer);
    }

    @Mutation(() => User)
    createInstitutionUser(
        @Args('input') userInput: UserInput,
        @CurrentUser() actor: User,
    ): Promise<User> {
        return this.userService.createOwnInstitutionUser(userInput, actor);
    }

    @Mutation(() => User)
    updateInstitutionUser(
        @Args({ name: 'id', type: () => Int }) userId: number,
        @Args('input') userInputData: UserUpdateInput,
        @CurrentUser() currentUser: BaseUser,
    ): Promise<User> {
        return this.userService.updateOwnInstitutionUser(userId, userInputData, currentUser);
    }

    @Mutation(() => Boolean)
    deleteInstitutionUser(
        @Args('id') id: number,
        @CurrentUser() currentUser: BaseUser,
    ): Promise<boolean> {
        return this.userService.deleteOwnInstitutionUser(id, currentUser);
    }

    @Mutation(() => Boolean)
    updateInstitutionUserPassword(
        @Args({ name: 'id', type: () => Int }) targetUserId: number,
        @Args('input') updatePasswordInput: UserUpdatePasswordInput,
        @CurrentUser() currentUser: User,
    ): Promise<boolean> {
        return this.userService.changeOwnInstitutionUserPassword(updatePasswordInput, targetUserId, currentUser);
    }

    @ResolveField(() => Institution)
    async institution(@Parent() user: User): Promise<Institution> {
        const institutionId = user.institutionId;

        return this.institutionLoader.findByIds.load(institutionId);
    }
}
