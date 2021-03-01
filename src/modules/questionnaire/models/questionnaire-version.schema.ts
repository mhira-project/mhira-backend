import { QuestionGroup, QuestionGroupSchema } from './question-group.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Questionnaire } from './questionnaire.schema';

export enum QuestionnaireStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    PRIVATE = 'PRIVATE',
}

@ObjectType()
@Schema({ collection: 'questionnaire_versions', timestamps: true })
export class QuestionnaireVersion extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => Questionnaire)
    @Prop({ type: [Types.ObjectId], ref: Questionnaire.name })
    questionnaire: Types.ObjectId | Questionnaire;

    @Field(() => String)
    @Prop()
    name: string;

    @Field(() => String)
    @Prop({
        type: 'string',
        enum: [
            QuestionnaireStatus.DRAFT,
            QuestionnaireStatus.PRIVATE,
            QuestionnaireStatus.PUBLISHED,
            QuestionnaireStatus.ARCHIVED,
        ],
        default: QuestionnaireStatus.DRAFT,
    })
    status: string;

    @Field(() => [String])
    @Prop({
        type: [String],
        min: 1,
        max: 20,
    })
    keywords: string[];

    @Field(() => String)
    @Prop()
    copyright: string;

    @Field(() => String)
    @Prop()
    website: string;

    @Field(() => String)
    @Prop()
    license: string;

    @Field(() => Number)
    @Prop()
    timeToComplete: number;

    @Field(() => [QuestionGroup])
    @Prop({ type: [QuestionGroupSchema] })
    questionGroups: QuestionGroup[];
}

export const QuestionnaireVersionSchema = SchemaFactory.createForClass(
    QuestionnaireVersion,
);
