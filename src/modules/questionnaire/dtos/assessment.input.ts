import { Field, InputType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
import { Questionnaire } from '../models/questionnaire.schema';

@InputType()
export class CreateQuestionnaireAssessmentInput {
    @Field()
    assessmentDate: Date;

    @Field(() => [String])
    questionnaires: Types.ObjectId[];
}

@InputType()
export class AnswerAssessmentInput {
    @Field(() => String)
    assessmentId: Types.ObjectId;

    @Field({ nullable: true, defaultValue: false })
    finishedAssessment: boolean;

    @Field(() => String)
    question: Types.ObjectId;

    @Field()
    textValue: string;

    @Field({ nullable: true })
    dateValue: Date;

    @Field(() => [String], { nullable: true })
    multipleChoiceValue: string[];

    @Field({ nullable: true })
    numberValue: number;

    @Field({ nullable: true })
    booleanValue: boolean;
}
