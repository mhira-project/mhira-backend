import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ collection: 'answers' })
export class Answer extends Document {
    @Field(() => String)
    @Prop()
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop({ type: Types.ObjectId, ref: 'Question' })
    question: Types.ObjectId;

    @Field(() => String)
    @Prop()
    textValue: string;

    @Field(() => [String])
    @Prop()
    multipleChoiceValue: String[];

    @Field(() => Number)
    @Prop()
    numberValue: number;

    @Field(() => Date)
    @Prop()
    dateValue: Date;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
