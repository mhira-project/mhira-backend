import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserUpdatePasswordInput {

    @Field(() => String)
    newPassword: string;

    @Field(() => String)
    newPasswordConfirmation: string;

}
