import { Resolver, Args, Query, Mutation, Int } from '@nestjs/graphql';
import { User } from '../models/institution-user.model';
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
import { Admin } from '../models/admin-user.model';
import { AdminService } from '../providers/admin.service';

@UseGuards(GqlAuthGuard, UserTypeGuard)
@AllowUserType(UserType.ADMIN)
@Resolver(() => Admin)
export class AdminResolver {
    constructor(
        private readonly adminService: AdminService,
    ) { }

    @Query(() => PaginatedUser, { name: 'ADMIN_getAdminUsers' })
    getAdminUsers(
        @Args() paginationArgs: PaginationArgs,
        @Args() userFilter: UserFilter,
    ): Promise<PaginatedUser> {
        return this.adminService.getAdminUsers(paginationArgs, userFilter);
    }

    @Mutation(() => User, { name: 'ADMIN_createAdminUser' })
    createAdminUser(
        @Args('input') userInput: UserInput,
    ): Promise<Admin> {
        return this.adminService.createAdminUser(userInput);
    }

    @Mutation(() => User, { name: 'ADMIN_updateAdminUser' })
    updateAdminUser(
        @Args({ name: 'id', type: () => Int }) id: number,
        @Args('input') userInputData: UserUpdateInput,
        @CurrentUser() currentUser: BaseUser,
    ): Promise<Admin> {
        return this.adminService.updateAdminUser(id, userInputData, currentUser);
    }

    @Mutation(() => Boolean, { name: 'ADMIN_deleteAdminUser' })
    deleteAdminUser(
        @Args('id') id: number,
        @CurrentUser() currentUser: BaseUser,
    ): Promise<boolean> {
        return this.adminService.deleteAdminUser(id, currentUser);
    }

    @Mutation(() => Boolean, { name: 'ADMIN_updateAdminUserPassword' })
    updateAdminUserPassword(
        @Args({ name: 'id', type: () => Int }) targetUserId: number,
        @Args('input') updatePasswordInput: UserUpdatePasswordInput,
        @CurrentUser() currentUser: User,
    ): Promise<boolean> {
        return this.adminService.changeAdminUserPassword(updatePasswordInput, targetUserId, currentUser);
    }
}
