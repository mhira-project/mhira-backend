import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ collection: 'answers' })
export abstract class Answer extends Document {
    @Field(() => String)
    @Prop()
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop()
    assessmentId: number;
}

@Schema({ collection: 'answers' })
export class TextAnswer extends Answer {
    @Field(() => String)
    @Prop()
    value: string;
}

@Schema({ collection: 'answers' })
export class MultipleChoiceAnswer extends Answer {
    @Field(() => [String])
    @Prop()
    value: String[];
}

@Schema({ collection: 'answers' })
export class NumericAnswer extends Answer {
    @Field(() => Number)
    @Prop()
    value: number;
}

@Schema()
export class DateAnswer extends Answer {
    @Field(() => Date)
    @Prop()
    value: Date;
}

export const TextAnswerSchema = SchemaFactory.createForClass(TextAnswer);
export const DateAnswerSchema = SchemaFactory.createForClass(DateAnswer);
export const NumericAnswerSchema = SchemaFactory.createForClass(NumericAnswer);
export const MultipleChoiceAnswerSchema = SchemaFactory.createForClass(
    MultipleChoiceAnswer,
);
