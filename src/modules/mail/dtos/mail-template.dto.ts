import { Field, InputType, Int } from "@nestjs/graphql";
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

    @Field(() => String, { nullable: true })
    name?: string;

    @Field(() => String, { nullable: true })
    subject?: string;

    @Field(() => String, { nullable: true })
    body?: string;

    @Field(() => AssessmentTypeEnum, { nullable: true })
    status?: AssessmentTypeEnum;

    @Field(() => TemplateModuleEnum, { nullable: true })
    module?: TemplateModuleEnum;
}