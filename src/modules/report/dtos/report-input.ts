import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class ReportInput {
    @Field(() => Boolean, { nullable: true })
    anonymus?: boolean;

    @Field(() => String)
    name: string;

    @Field(() => String)
    description: string;

    @Field(() => Boolean, { nullable: true })
    status?: boolean;

    @Field(() => String, { nullable: true })
    repositoryLink?: string;

    @Field(() => String, { nullable: true })
    appName?: string;

    @Field(() => String, { nullable: true })
    url?: string;

    @Field(() => String)
    resources: string;

    @Field(() => [Int])
    roles: number[];
}
