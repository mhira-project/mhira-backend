import { Answer } from './answer.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

export const enum questionType {
    BEGIN_GROUP = 'begin_group',
    END_GROUP = 'end_group',
    INTEGER = 'integer',
    DECIMAL = 'decimal',
    TEXT = 'text',
    SELECT_ONE = 'select_one',
    SELECT_MULTIPLE = 'select_multiple',
    DATE = 'date',
    TIME = 'time',
    DATETIME = 'date_time',
    NOTE = 'note',
    VISUAL_ANALOG_SCALES = 'visual_analog_scales',
}

@ObjectType()
@Schema()
export class Choice extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop()
    name: string;

    @Field(() => String)
    @Prop()
    label: string;

    @Field(() => String)
    @Prop()
    image: string;
}

export const ChoiceSchema = SchemaFactory.createForClass(Choice);

@ObjectType()
@Schema({ collection: 'questions' })
export class Question extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop()
    name: string;

    @Field(() => String)
    @Prop()
    label: string;

    @Field(() => String)
    @Prop()
    type: string;

    @Field(() => String)
    @Prop()
    hint: string;

    @Field(() => String)
    @Prop()
    relevant: string;

    @Field(() => String)
    @Prop()
    calculation: string;

    @Field(() => String)
    @Prop()
    constraint: string;

    @Field(() => String)
    @Prop()
    constraintMessage: string;

    @Field(() => Number)
    @Prop()
    min: number;

    @Field(() => Number)
    @Prop()
    max: number;

    @Field(() => Boolean)
    @Prop()
    required: boolean;

    @Field(() => String)
    @Prop()
    requiredMessage: string;

    @Field(() => String)
    @Prop()
    image: string;

    @Field(() => [Choice])
    @Prop({ type: [Types.ObjectId], ref: Choice.name })
    choices: Choice[];

    @Field(() => [Answer])
    @Prop({ type: [Types.ObjectId], ref: Answer.name })
    answers: Answer[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
