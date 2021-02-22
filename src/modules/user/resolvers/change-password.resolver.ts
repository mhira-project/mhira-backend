import { Resolver, Args, Mutation, Int } from '@nestjs/graphql';
import { User } from '../models/user.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { ChangePasswordService } from '../providers/change-password.service';
import { ChangeOwnPasswordInput } from '../dto/change-own-password.input';
import { ChangePasswordInput } from '../dto/change-password.input';

@Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class ChangePasswordResolver {
    constructor(
        private readonly service: ChangePasswordService,
    ) { }

    // change password
    @Mutation(() => Boolean, { description: 'Change password for currently logged in user' })
    @UseGuards(GqlAuthGuard)
    changePassword(
        @Args() input: ChangeOwnPasswordInput,
        @CurrentUser() currentUser: User
    ): Promise<boolean> {

        return this.service.changeOwnPassword(input, currentUser);

    }

    @Mutation(() => Boolean)
    updateUserPassword(
        @Args({ name: 'id', type: () => Int }) targetUserId: number,
        @Args('input') input: ChangePasswordInput,
        @CurrentUser() currentUser: User,
    ): Promise<boolean> {
        return this.service.changeOtherUserPassword(input, targetUserId, currentUser.id);
    }
}
