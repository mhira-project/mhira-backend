import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { AssessmentTypeEnum } from "src/modules/assessment/enums/assessment-type.enum";
import { TemplateModuleEnum } from "../enums/template-module.enum";



@InputType()
export class CreateEmailTemplate {
    @Field(() => String)
    name: string;

    @Field(() => String)
    subject?: string;

    @Field(() => String)
    body: string;

    @Field(() => AssessmentTypeEnum)
    status: AssessmentTypeEnum;

    @Field(() => TemplateModuleEnum)
    module: TemplateModuleEnum;

    @Field(() => Boolean, { defaultValue: false })
    isPublic: boolean;

    @Field(() => [Int], { nullable: true })
    departmentIds: number[];
}

@InputType()
export class UpdateEmailTemplate {
    @Field(() => Int)
    id: number

    @IsOptional()
    @Field(() => String)
    name?: string;

    @IsOptional()
    @Field(() => String)
    subject?: string;

    @IsOptional()
    @Field(() => String)
    body?: string;

    @IsOptional()
    @Field(() => AssessmentTypeEnum)
    status?: AssessmentTypeEnum;

    @IsOptional()
    @Field(() => TemplateModuleEnum)
    module?: TemplateModuleEnum;

    @IsOptional()
    @Field(() => Boolean)
    isPublic: boolean;

    @IsOptional()
    @Field(() => [Int], { nullable: true })
    departmentIds: number[]

}