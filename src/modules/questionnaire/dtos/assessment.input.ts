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
    assessmentId: Types.ObjectId;

    @Field({ nullable: true, defaultValue: false })
    finishedAssessment: boolean;

    @Field()
    answers: Answer[];
}
