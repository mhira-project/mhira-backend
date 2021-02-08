import { Prop, Schema } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from './answer.schema';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

export const AssessmentStatusList = [
    'COMPLETED',
    'PENDING',
    'PARTIALLY COMPLETED',
    'EXPIRED',
    'ARCHIVED',
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

    @Prop({ type: 'enum', enum: AssessmentStatusList })
    status: string;

    @Field(() => [String])
    @Prop({ type: [Types.ObjectId], ref: 'questionnaires' })
    questionnaires: Types.ObjectId[];

    @Field(() => [Answer])
    @Prop({ type: [AnswerSchema] })
    answers: Answer[];
}
