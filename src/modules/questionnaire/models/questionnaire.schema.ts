import { QuestionGroup, QuestionGroupSchema } from './question-group.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { QuestionnaireChoice } from 'src/modules/patient/dto/patient-report.response';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';

export enum QuestionnaireStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    PRIVATE = 'PRIVATE',
}

/**
 * Compatibility measure: up to Mongoose 7 the enum validator refuses `null`
 * (`updateQuestionnaire` with `status: null`); from Mongoose 8 it lets `null`
 * through for an optional path, and the questionnaire would be stored with
 * it. This validator keeps the refusal, and is declared like the enum
 * validator (type and enum values) so the error, including what reaches the
 * client, is the one the enum validator gives.
 */
const statusIsNotNull = {
    validator: (status: QuestionnaireStatus | null) => status !== null,
    message: '`null` is not a valid enum value for path `status`.',
    type: 'enum',
    enumValues: Object.values(QuestionnaireStatus),
};

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
        validate: statusIsNotNull,
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