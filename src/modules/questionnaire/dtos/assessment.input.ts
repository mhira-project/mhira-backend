import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { Answer } from '../models/answer.schema';

@InputType()
export class CreateAssessmentInput {
    @Field()
    assessmentDate: Date;

    @Field()
    questionnaires: Types.ObjectId[];
}

@InputType()
export class AnswerAssessmentInput {
    @Field()
    assessmentId: string;

    @Field({ nullable: true, defaultValue: false })
    finishedAssessment: boolean;

    @Field()
    question: string;

    @Field()
    textValue: string;

    @Field()
    dateValue: Date;

    @Field()
    multipleChoiceValue: string[];

    @Field()
    numberValue: number;

    @Field()
    booleanValue: boolean;
}
