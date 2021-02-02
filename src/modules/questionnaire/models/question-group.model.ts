import { Question } from './question.model';
import { Translation } from './translation.model';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class QuestionGroup {
    _id: Types.ObjectId;

    @Prop()
    label: string | Translation[];

    @Prop()
    questions: Question[];
}

export type QuestionGroupDocument = QuestionGroup & Document;

export const QuestionGroupSchema = SchemaFactory.createForClass(QuestionGroup);
