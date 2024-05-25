import { Field, InputType, ObjectType } from "@nestjs/graphql";

@InputType()
export class CreateOneConsentInput {
    @Field(() => String)
    name: string;

    @Field(() => String)
    description: string;

    @Field(() => String)
    consent1: string;

    @Field(() => String, { nullable: true })
    consent2: string;

    @Field(() => String, { nullable: true })
    submitContent: string;
}

@InputType()
export class UpdateOneConsentInput {
    @Field(() => Number)
    id: number;

    @Field(() => String)
    name: string;

    @Field(() => String)
    description: string;

    @Field(() => String)
    consent1: string;

    @Field(() => String, { nullable: true })
    consent2: string;

    @Field(() => String, { nullable: true })
    submitContent: string;
}

@InputType()
export class DeleteOneConsentInput {
    @Field(() => Number)
    id: number;
}