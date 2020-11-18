import { ArgsType, Field } from '@nestjs/graphql';
import { Matches } from 'class-validator';

@ArgsType()
export class ChangePasswordRequest {

  @Field(() => String)
  currentPassword: string;

  @Matches(
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
    { message: 'Password must be atleast 8 characters long and contain 1 lowercase, 1 uppercase, 1 numeric, and one special character' }
  )
  @Field(() => String)
  newPassword: string;

  @Field(() => String)
  newPasswordConfirmation: string;

}
