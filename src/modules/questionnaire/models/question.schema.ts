import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

export const enum QuestionType {
    BEGIN_GROUP = 'begin_group',
    END_GROUP = 'end_group',
    INTEGER = 'integer',
    DECIMAL = 'decimal',
    CHECKBOX = 'checkbox',
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
    @Field(() => String, { nullable: true })
    _id: Types.ObjectId;

    @Field(() => String, { nullable: true })
    @Prop()
    name: string;

    @Field(() => String, { nullable: true })
    @Prop()
    label: string;

    @Field(() => String, { nullable: true })
    @Prop()
    image: string;
}

export const ChoiceSchema = SchemaFactory.createForClass(Choice);

@ObjectType()
@Schema()
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

    @Field(() => String, { nullable: true })
    @Prop()
    hint: string;

    @Field(() => String, { nullable: true })
    @Prop()
    relevant: string;

    @Field(() => String, { nullable: true })
    @Prop()
    calculation: string;

    @Field(() => String, { nullable: true })
    @Prop()
    constraint: string;

    @Field(() => String, { nullable: true })
    @Prop()
    constraintMessage: string;

    @Field(() => Number, { nullable: true })
    @Prop()
    min: number;

    @Field(() => Number, { nullable: true })
    @Prop()
    max: number;

    @Field(() => Boolean, { nullable: true })
    @Prop()
    required: boolean;

    @Field(() => String, { nullable: true })
    @Prop()
    requiredMessage: string;

    @Field(() => String, { nullable: true })
    @Prop()
    image: string;

    @Field(() => String, { nullable: true })
    @Prop()
    appearance: string;

    @Field(() => String, { nullable: true })
    @Prop()
    default: string;

    @Field(() => [Choice], { nullable: true })
    @Prop({ type: [ChoiceSchema] })
    choices: Choice[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
