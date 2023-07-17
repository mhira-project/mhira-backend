import { Question, QuestionSchema } from './question.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema()
export class QuestionGroup extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => String, { nullable: true })
    @Prop()
    label: string;

    @Field(() => String, { nullable: true })
    @Prop()
    appearance: string;

    @Field(() => [Question])
    @Prop({ type: [QuestionSchema] })
    questions: Question[] = [];
}

export const QuestionGroupSchema = SchemaFactory.createForClass(QuestionGroup);
