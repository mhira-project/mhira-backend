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
