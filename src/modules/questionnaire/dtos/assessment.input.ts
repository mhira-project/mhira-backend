import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class CreateQuestionnaireAssessmentInput {
    @Field()
    assessmentDate: Date;

    @Field(() => [String])
    questionnaires: Types.ObjectId[];
}

@InputType()
export class AnswerAssessmentInput {
    @Field()
    assessmentId: string;

    @Field({ nullable: true, defaultValue: false })
    finishedAssessment: boolean;

    @Field(() => String)
    question: Types.ObjectId;

    @Field()
    textValue: string;

    @Field()
    dateValue: Date;

    @Field(() => [String])
    multipleChoiceValue: string[];

    @Field()
    numberValue: number;

    @Field()
    booleanValue: boolean;
}
