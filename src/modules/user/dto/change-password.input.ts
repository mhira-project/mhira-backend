import { Field, InputType } from '@nestjs/graphql';


@InputType()
export class ChangePasswordInput {

    @Field(() => String)
    newPassword: string;

    @Field(() => String)
    newPasswordConfirmation: string;

    @Field(() => String, { defaultValue: true })
    requirePasswordChangeOnLogin?: boolean;

}
