import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ChangePasswordRequest {

  @Field(() => String)
  currentPassword: string;

  @Field(() => String)
  newPassword: string;

  @Field(() => String)
  newPasswordConfirmation: string;

}
