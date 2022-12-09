import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class SendMailInput {
    @Field(() => String)
    to: string;

    @Field(() => String)
    from: string;

    @Field(() => String)
    subject: string;

    @Field(() => String)
    title: string;

    @Field(() => String)
    body: string;
}