import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateDisclaimerInput {
    @Field(() => String)
    type: string;

    @Field(() => String)
    description: string;
}
