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
    consent3: string;

    @Field(() => String, { nullable: true })
    consent4: string;

    @Field(() => String, { nullable: true })
    consent5: string;

    @Field(() => String, { nullable: true })
    consent6: string;

    @Field(() => String, { nullable: true })
    consent7: string;

    @Field(() => String, { nullable: true })
    submitContent: string;

    @Field(() => String, { nullable: true })
    title: string;

    @Field(() => String, { nullable: true })
    acceptLabel: string;

    @Field(() => String, { nullable: true })
    submitLabel: string;
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
    consent3: string;

    @Field(() => String, { nullable: true })
    consent4: string;

    @Field(() => String, { nullable: true })
    consent5: string;

    @Field(() => String, { nullable: true })
    consent6: string;

    @Field(() => String, { nullable: true })
    consent7: string;

    @Field(() => String, { nullable: true })
    submitContent: string;

    @Field(() => String, { nullable: true })
    title: string;

    @Field(() => String, { nullable: true })
    acceptLabel: string;

    @Field(() => String, { nullable: true })
    submitLabel: string;
}

@InputType()
export class DeleteOneConsentInput {
    @Field(() => Number)
    id: number;
}