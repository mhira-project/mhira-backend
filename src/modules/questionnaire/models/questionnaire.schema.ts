import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { FilterableField } from '@nestjs-query/query-graphql';
import { QuestionnaireChoice } from 'src/modules/patient/dto/patient-report.response';


@ObjectType()
@Schema({ collection: 'questionnaires', timestamps: {} })
export class Questionnaire extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @FilterableField(() => String)
    @Prop()
    language: string;

    @FilterableField(() => String)
    @Prop()
    abbreviation: string;
}

export const QuestionnaireSchema = SchemaFactory.createForClass(
    Questionnaire,
).index({ language: 1, abbreviation: 1 }, { unique: true }); // index to ensure that translations for the same questionnaire can be uploaded

interface IQuestion {
    _id: Types.ObjectId;
    type: string;
    name: string;
    label: string;
    hint: string;
    required: boolean;
    choices: QuestionnaireChoice[];
}

export interface IQuestionGroup {
    questions: IQuestion[];
    _id: Types.ObjectId;
    label: string;
}

export interface AnsweredQuestions {
    multipleChoiceValue: string[];
    question: string;
    dateValue: Date;
    valid: boolean;
    createdAt: Date;
    updatedAt: Date;
    textValue: string;
    combinedDate: Date | null;
    numberValue: number;
    questionId: string;
}