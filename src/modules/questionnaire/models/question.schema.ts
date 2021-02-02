import { Answer } from './answer.schema';
import { Translation } from './translation.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field } from '@nestjs/graphql';

export const questionOptions = { discriminatorKey: 'questionType' };

export const enum questionType {
    INTEGER = 'integer',
    DECIMAL = 'decimal',
    TEXT = 'text',
    SELECT_ONE = 'select_one',
    SELECT_MULTIPLE = 'select_multiple',
    DATE = 'date',
    TIME = 'time',
    DATETIME = 'dateTime',
    NOTE = 'note',
}

@Schema()
export class Choice extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop()
    name: string;

    @Field(() => [Translation])
    @Prop({ type: [Types.ObjectId], ref: Translation.name })
    label: Translation[];
}

export const ChoiceSchema = SchemaFactory.createForClass(Choice);

@Schema({ collection: 'questions' })
export class Question extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop()
    name: string;

    @Field(() => [Translation])
    @Prop({ type: [Types.ObjectId], ref: Translation.name })
    label: Translation[];

    @Field(() => String)
    @Prop()
    type: questionType;

    @Field(() => [Translation])
    @Prop({ type: [Types.ObjectId], ref: Translation.name })
    hint: Translation[];

    @Field(() => String)
    @Prop()
    relevant: string;

    @Field(() => String)
    @Prop()
    calculation: string;

    @Field(() => String)
    @Prop()
    constraint: string;

    @Field(() => [Translation])
    @Prop()
    constraintMessage: Translation[];

    @Field(() => Boolean)
    @Prop()
    required: boolean;

    @Field(() => [Translation])
    @Prop({ type: [Types.ObjectId], ref: Translation.name })
    requiredMessage: Translation[];

    @Field(() => [Translation])
    @Prop({ type: [Types.ObjectId], ref: Translation.name })
    image: Translation[];

    @Field(() => [Choice])
    @Prop({ type: [Types.ObjectId], ref: Choice.name })
    choices: Choice[];

    @Field(() => [Answer])
    @Prop({ type: [Types.ObjectId], ref: Answer.name })
    answers: Answer[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
