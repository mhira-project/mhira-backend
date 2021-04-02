import { Field, InputType, Int } from '@nestjs/graphql';
import { ArrayNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class CreateQuestionnaireAssessmentInput {
    @Field(() => String)
    name: string;

    @Field(() => Int)
    patientId: number;

    @Field(() => Int)
    clinicianId: number;

    @Field(() => String)
    informant: string;

    @Field(() => [String])
    @ArrayNotEmpty()
    questionnaires: Types.ObjectId[];
}

@InputType()
export class UpdateQuestionnaireAssessmentInput extends CreateQuestionnaireAssessmentInput {
    @Field(() => Int)
    assessmentId: number;
}

@InputType()
export class AnswerAssessmentInput {
    @Field(() => String)
    assessmentId: Types.ObjectId;

    @Field(() => String)
    questionnaireVersionId: Types.ObjectId;

    @Field({ nullable: true, defaultValue: false })
    finishedAssessment: boolean;

    @Field(() => String)
    question: Types.ObjectId;

    @Field(() => String, { nullable: true })
    textValue?: string;

    @Field({ nullable: true })
    dateValue?: Date;

    @Field(() => [String], { nullable: true })
    multipleChoiceValue?: string[];

    @Field({ nullable: true })
    numberValue?: number;

    @Field({ nullable: true })
    booleanValue?: boolean;
}
