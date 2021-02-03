import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { User } from 'src/modules/user/models/user.model';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './auth.guard';
import { CurrentUser } from './auth-user.decorator';
import { Permission } from '../permission/models/permission.model';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => LoginResponseDto, { description: 'Login method for Institution Users' })
  login(@Args() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Mutation(() => Boolean, { description: 'Login method for Institution Users' })
  @UseGuards(GqlAuthGuard)
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user);
  }

  // profile
  @Query(() => User, { description: 'Get User Profile for currently logged in user' })
  @UseGuards(GqlAuthGuard)
  getUserProfile(@CurrentUser() user: User): Promise<User> {
    return Promise.resolve(user);
  }


  // permission grants
  @Query(() => [Permission], { description: 'Get User Permission Grants. ' })
  @UseGuards(GqlAuthGuard)
  userPermissionGrants(@CurrentUser() user: User): Promise<Permission[]> {

    return this.authService.userPermissionGrants(user);
  }

  // reset password ?? @TODO

}
