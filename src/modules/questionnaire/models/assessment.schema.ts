import { Prop, Schema } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from './answer.schema';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

export enum AssessmentStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
    PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
    EXPIRED = 'EXPIRED',
    ARCHIVED = 'ARCHIVED',
}

export const AssessmentStatusList = [
    // TODO: automatically generate list but keep this at the moment
    AssessmentStatus.COMPLETED,
    AssessmentStatus.PENDING,
    AssessmentStatus.PARTIALLY_COMPLETED,
    AssessmentStatus.EXPIRED,
    AssessmentStatus.ARCHIVED,
];

@ObjectType()
@Schema({ collection: 'assessments' })
export class Assessment extends Document {
    @Field(() => String)
    @Prop()
    _id: Types.ObjectId;

    @Field(() => Date)
    @Prop()
    assessmentDate: Date;

    @Prop({
        type: 'enum',
        enum: AssessmentStatusList,
        default: AssessmentStatus.PENDING,
    })
    status: string;

    @Field(() => [String])
    @Prop({ type: [Types.ObjectId], ref: 'questionnaires' })
    questionnaires: Types.ObjectId[];

    @Field(() => [Answer])
    @Prop({ type: [AnswerSchema] })
    answers: Answer[];

    @Field(() => Date)
    @Prop({ default: new Date() })
    createdAt: Date;

    @Field(() => Date)
    @Prop()
    updatedAt: Date;
}
