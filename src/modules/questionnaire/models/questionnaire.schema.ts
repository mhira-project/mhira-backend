import { QuestionGroup, QuestionGroupSchema } from './question-group.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { QuestionnaireChoice } from 'src/modules/patient/dto/patient-report.response';
import { FilterableField } from '@nestjs-query/query-graphql';

export enum QuestionnaireStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    PRIVATE = 'PRIVATE',
}

@ObjectType()
@Schema({ collection: 'questionnaires', timestamps: {} })
export class Questionnaire extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @FilterableField(() => String)
    @Prop()
    name: string;

    @FilterableField(() => String)
    @Prop({
        type: 'string',
        enum: Object.values(QuestionnaireStatus),
        default: QuestionnaireStatus.DRAFT,
    })
    status: QuestionnaireStatus;

    @Field(() => String, { nullable: true })
    @Prop({
        type: 'string',
    })
    xForm: string;

    // to be filterable this would potentially need allowedComparisons option
    @Field(() => [String], { nullable: true })
    @Prop({
        type: [String],
        min: 1,
        max: 20,
    })
    keywords: string[];

    @Field(() => String)
    @Prop()
    copyright: string;

    @Field(() => String, { nullable: true })
    @Prop()
    website: string;

    @Field(() => String, { nullable: true })
    @Prop()
    license: string;

    @Field(() => Number, { nullable: true })
    @Prop()
    timeToComplete: number;

    @Field(() => [QuestionGroup])
    @Prop({ type: [QuestionGroupSchema] })
    questionGroups: QuestionGroup[];

    @FilterableField(() => String)
    @Prop()
    language: string;

    @FilterableField(() => String)
    @Prop()
    abbreviation: string;

    @Field(() => String, { nullable: true })
    @Prop()
    description: string;

    @FilterableField(() => Boolean)
    @Prop()
    zombie: boolean;

    @FilterableField(() => Date)
    @Prop()
    createdAt: Date;

    @Field(() => Date)
    @Prop()
    updatedAt: Date;
}

export const QuestionnaireSchema = SchemaFactory.createForClass(
    Questionnaire,
).index({ language: 1, abbreviation: 1 }, { unique: true });

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