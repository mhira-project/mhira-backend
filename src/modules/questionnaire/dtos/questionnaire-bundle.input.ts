import { Field, InputType } from "@nestjs/graphql";
import { ArrayNotEmpty } from "class-validator";
import { Types } from "mongoose";

@InputType()
export class CreateQuestionnaireBundleInput {
    @Field(() => String)
    name: string;

    @Field(() => [String])
    @ArrayNotEmpty()
    questionnaireIds: Types.ObjectId[];

    @Field(() => [Number], { nullable: true })
    departmentIds: number[]
}

@InputType()
export class UpdateQuestionnaireBundleInput extends CreateQuestionnaireBundleInput {
    @Field(() => String)
    _id: string;
}