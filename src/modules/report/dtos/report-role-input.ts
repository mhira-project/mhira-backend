import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ReportRoleInput {
    @Field(() => [Number])
    roleIds!: number[];

    @Field()
    reportId!: number;
} 
