import { Field, InputType } from '@nestjs/graphql';
import { ArrayNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { AssessmentStatus } from '../enums/assessment-status.enum';

@InputType()
export class CreateQuestionnaireAssessmentInput {
    @Field(() => [String])
    @ArrayNotEmpty()
    questionnaires: Types.ObjectId[];
}

@InputType()
export class UpdateQuestionnaireAssessmentInput extends CreateQuestionnaireAssessmentInput { }

@InputType()
export class AnswerAssessmentInput {
    @Field(() => String)
    assessmentId: Types.ObjectId;

    @Field(() => String)
    questionnaireVersionId: Types.ObjectId;

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

@InputType()
export class ChangeAssessmentStatusInput {
    @Field(() => String)
    assessmentId: Types.ObjectId;

    @Field(() => AssessmentStatus)
    status: AssessmentStatus;
}