import { Question } from './question.schema';
import { Translation } from './translation.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field } from '@nestjs/graphql';

@Schema()
export class QuestionGroup extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => [Translation])
    @Prop({ type: [Types.ObjectId], ref: Translation.name })
    label: Translation[];

    @Field(() => [Question])
    @Prop({ type: [Types.ObjectId], ref: Question.name })
    questions: Question[];
}

export const QuestionGroupSchema = SchemaFactory.createForClass(QuestionGroup);
