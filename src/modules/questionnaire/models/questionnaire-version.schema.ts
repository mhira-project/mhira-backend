import { QuestionGroup, QuestionGroupSchema } from './question-group.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Questionnaire } from './questionnaire.schema';
import { FilterableField, FilterableRelation } from '@nestjs-query/query-graphql';

export enum QuestionnaireStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    PRIVATE = 'PRIVATE',
}

@ObjectType()
@FilterableRelation('questionnaire', () => Questionnaire, { nullable: true, disableRemove: true })
@Schema({ collection: 'questionnaire_versions', timestamps: {} })
export class QuestionnaireVersion extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => Questionnaire)
    @Prop({ type: Types.ObjectId, ref: Questionnaire.name })
    questionnaire: Types.ObjectId | Questionnaire;

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

    @Field(() => Date)
    @Prop()
    createdAt: Date;

    @Field(() => Date)
    @Prop()
    updatedAt: Date;
}

export const QuestionnaireVersionSchema = SchemaFactory.createForClass(
    QuestionnaireVersion,
);
