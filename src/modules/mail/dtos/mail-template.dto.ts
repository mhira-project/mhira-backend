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
export class CreateEmailTemplate {
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
export class UpdateEmailTemplate {
    @Field(() => Int)
    id: number

    @Field(() => String, { nullable: true })
    name?: string;

    @Field(() => String, { nullable: true })
    subject?: string;

    @Field(() => String, { nullable: true })
    body?: string;

    @Field(() => Boolean, { nullable: true })
    status?: boolean;

    @Field(() => String, { nullable: true })
    module?: string;
}