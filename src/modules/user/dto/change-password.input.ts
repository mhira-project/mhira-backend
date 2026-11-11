import { Field, InputType } from '@nestjs/graphql';


@InputType()
export class ChangePasswordInput {

    @Field(() => String)
    newPassword: string;

    @Field(() => String)
    newPasswordConfirmation: string;

    // A String in the schema since v1.1.6, read as a truthy value.
    @Field(() => String, { nullable: true, defaultValue: 'true' })
    requirePasswordChangeOnLogin?: string;

}
