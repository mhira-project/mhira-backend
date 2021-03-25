import { QuestionGroup, QuestionGroupSchema } from './question-group.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Questionnaire } from './questionnaire.schema';

export enum QuestionnaireStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    PRIVATE = 'PRIVATE',
}

@ObjectType()
@Schema({ collection: 'questionnaire_versions', timestamps: {} })
export class QuestionnaireVersion extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => Questionnaire)
    @Prop({ type: Types.ObjectId, ref: Questionnaire.name })
    questionnaire: Types.ObjectId | Questionnaire;

    @Field(() => String)
    @Prop()
    name: string;

    @Field(() => String)
    @Prop({
        type: 'string',
        enum: Object.values(QuestionnaireStatus),
        default: QuestionnaireStatus.DRAFT,
    })
    status: QuestionnaireStatus;

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

    @Field(() => Number)
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
