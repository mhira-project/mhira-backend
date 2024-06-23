import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ConsentContent {
    @Field(() => String, { nullable: true })
    name: string;

    @Field(() => String, { nullable: true })
    description: string;

    @Field(() => String, { nullable: true })
    checkbox1: string;

    @Field(() => String, { nullable: true })
    checkbox2: string;

    @Field(() => String, { nullable: true })
    checkbox3: string;

    @Field(() => String, { nullable: true })
    checkbox4: string;

    @Field(() => String, { nullable: true })
    checkbox5: string;

    @Field(() => String, { nullable: true })
    checkbox6: string;

    @Field(() => String, { nullable: true })
    checkbox7: string;
}