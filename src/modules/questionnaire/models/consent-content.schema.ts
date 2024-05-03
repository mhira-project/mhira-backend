import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ConsentContent {
    @Field(() => String)
    description: string;

    @Field(() => String)
    checkbox1: string;

    @Field(() => String)
    checkbox2: string;
}