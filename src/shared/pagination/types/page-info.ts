import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class PageInfoDto {

    @Field({ nullable: true })
    startCursor: string;

    @Field({ nullable: true })
    endCursor: string;

    @Field()
    hasPreviousPage: boolean;

    @Field()
    hasNextPage: boolean;
}
