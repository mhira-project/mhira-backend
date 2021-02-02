import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Answer {
    _id: Types.ObjectId;

    @Prop()
    assessmentId: number;

    @Prop()
    value: Object;
}

export type AnswerDocument = Answer & Document;

export const AnswerSchema = SchemaFactory.createForClass(Answer);
