import { QuestionGroup, QuestionGroupSchema } from './question-group.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ collection: 'questionnaire_versions' })
export class QuestionnaireVersion extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => [String])
    @Prop()
    name: string;

    @Field(() => String)
    @Prop({ type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
    status: string;

    @Field(() => String)
    @Prop()
    copyright: string;

    @Field(() => String)
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
}

export const QuestionnaireVersionSchema = SchemaFactory.createForClass(
    QuestionnaireVersion,
); // index to ensure that translations for the same questionnaire can be uploaded
