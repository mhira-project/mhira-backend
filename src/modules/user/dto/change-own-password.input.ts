import { ArgsType, Field } from '@nestjs/graphql';
import { ChangePasswordInput } from './change-password.input';

@ArgsType()
export class ChangeOwnPasswordInput extends ChangePasswordInput {

  @Field(() => String)
  currentPassword: string;

  @Field(() => String)
  newPassword: string;

  @Field(() => String)
  newPasswordConfirmation: string;

}
