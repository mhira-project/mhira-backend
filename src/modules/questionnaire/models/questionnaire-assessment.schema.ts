import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from './answer.schema';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { QuestionnaireVersion } from './questionnaire-version.schema';

export enum AssessmentStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
    PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
    EXPIRED = 'EXPIRED',
    ARCHIVED = 'ARCHIVED',
}

@ObjectType()
@Schema({ collection: 'assessments', timestamps: true })
export class QuestionnaireAssessment extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => Date)
    @Prop()
    assessmentDate: Date;

    @Field(() => String)
    @Prop({
        type: 'string',
        enum: [
            AssessmentStatus.COMPLETED,
            AssessmentStatus.PENDING,
            AssessmentStatus.PARTIALLY_COMPLETED,
            AssessmentStatus.EXPIRED,
            AssessmentStatus.ARCHIVED,
        ],
        default: AssessmentStatus.PENDING,
    })
    status: AssessmentStatus;

    @Field(() => [QuestionnaireVersion])
    @Prop({ type: [Types.ObjectId], ref: QuestionnaireVersion.name })
    questionnaires: Types.ObjectId[] | QuestionnaireVersion[];

    @Field(() => [Answer])
    @Prop({ type: [AnswerSchema] })
    answers: Answer[];
}

export const AssessmentSchema = SchemaFactory.createForClass(
    QuestionnaireAssessment,
);
