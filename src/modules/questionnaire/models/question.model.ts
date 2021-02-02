import { Answer } from './answer.model';
import { Translation } from './translation.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
export class Question {
    _id: Types.ObjectId;

    @Prop()
    name: string;

    @Prop()
    label: string | Translation[];

    @Prop()
    type: questionType;

    @Prop()
    hint: string | Translation[];

    @Prop()
    relevant: string;

    @Prop()
    calculation: string;

    @Prop()
    constraint: string;

    @Prop()
    constraintMessage: string | Translation[];

    @Prop()
    required: boolean;

    @Prop()
    image: string | Translation[];

    @Prop()
    choices: Choice[];

    @Prop()
    answers: Answer[];
}

export type QuestionDocument = Question & Document;

export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema()
export class Choice {
    _id: Types.ObjectId;

    @Prop()
    name: string;

    @Prop()
    label: string | Translation[];
}

export type ChoiceDocument = Choice & Document;

export const ChoiceSchema = SchemaFactory.createForClass(Choice);
