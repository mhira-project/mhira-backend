import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ConsentContent {
    @Field(() => String, { nullable: true })
    description: string;

    @Field(() => String, { nullable: true })
    checkbox1: string;

    @Field(() => String, { nullable: true })
    checkbox2: string;
}