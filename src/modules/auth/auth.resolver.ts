import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { BaseUser as User } from 'src/modules/user/models/base-user.model';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './auth.guard';
import { CurrentUser } from './auth-user.decorator';
import { ChangePasswordRequest } from './dto/change-password-request.dto';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Query(() => LoginResponseDto, { description: 'Login method for Institution Users' })
  login(@Args() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  // profile
  @Query(() => User, { description: 'Get User Profile for currently logged in user' })
  @UseGuards(GqlAuthGuard)
  getUserProfile(@CurrentUser() user: User): Promise<User> {
    return Promise.resolve(user);
  }

  // change password
  @Mutation(() => Boolean, { description: 'Change password for currently logged in user' })
  @UseGuards(GqlAuthGuard)
  changePassword(
    @Args() changePasswordRequest: ChangePasswordRequest,
    @CurrentUser() currentUser: User
  ): Promise<boolean> {

    return this.authService.changePassword(changePasswordRequest, currentUser);

  }

  // reset password ?? @TODO

}
