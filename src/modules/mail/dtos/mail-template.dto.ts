import { Field, InputType, Int } from "@nestjs/graphql";

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


@InputType()
export class CreateEmail {
    @Field(() => String)
    name: string;

    @Field(() => String)
    subject: string;

    @Field(() => String)
    body: string;

    @Field(() => Boolean)
    status: boolean;

    @Field(() => String)
    module: string;
}

@InputType()
export class UpdateEmail extends CreateEmail {
    @Field(() => Int)
    id: number
}