import { Resolver, Args, Query, Mutation, Int } from '@nestjs/graphql';
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
import { UserTypeGuard } from 'src/modules/permission/guards/user-type.guard';
import { AllowUserType } from 'src/modules/permission/decorators/user-type.decorator';
import { UserType } from '../models/user-type.enum';
import { BaseUser } from '../models/base-user.model';

@UseGuards(GqlAuthGuard, UserTypeGuard)
@AllowUserType(UserType.ADMIN)
@Resolver()
export class AdminUserResolver {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Query(() => PaginatedUser, { name: 'ADMIN_getInstitutionUsers' })
    getAllInstitutionUsers(
        @Args() paginationArgs: PaginationArgs,
        @Args() userFilter: UserFilter,
        @Args({ name: 'institutionId', type: () => Int, nullable: true }) institutionId: number,
    ): Promise<PaginatedUser> {
        return this.userService.getInstitutionUsers(paginationArgs, userFilter, institutionId);
    }

    @Mutation(() => User, { name: 'ADMIN_createInstitutionUser' })
    createInstitutionUser(
        @Args('input') userInput: UserInput,
        @Args({ name: 'institutionId', type: () => Int }) institutionId: number,
    ): Promise<User> {
        return this.userService.createInstitutionUser(userInput, institutionId);
    }

    @Mutation(() => User, { name: 'ADMIN_updateInstitutionUser' })
    updateInstitutionUser(
        @Args({ name: 'id', type: () => Int }) id: number,
        @Args('input') userInputData: UserUpdateInput,
        @CurrentUser() currentUser: BaseUser,
    ): Promise<User> {
        return this.userService.updateAnyInstitutionUser(id, userInputData, currentUser);
    }

    @Mutation(() => Boolean, { name: 'ADMIN_deleteInstitutionUser' })
    deleteInstitutionUser(
        @Args('id') id: number,
        @CurrentUser() currentUser: BaseUser,
    ): Promise<boolean> {
        return this.userService.deleteAnyInstitutionUser(id, currentUser);
    }

    @Mutation(() => Boolean, { name: 'ADMIN_updateInstitutionUserPassword' })
    updateInstitutionUserPassword(
        @Args({ name: 'id', type: () => Int }) targetUserId: number,
        @Args('input') updatePasswordInput: UserUpdatePasswordInput,
        @CurrentUser() currentUser: User,
    ): Promise<boolean> {
        return this.userService.changeAnyInstitutionUserPassword(updatePasswordInput, targetUserId, currentUser);
    }
}
