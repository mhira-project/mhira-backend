import { QuestionGroup, QuestionGroupSchema } from './question-group.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ collection: 'questionnaires' })
export class Questionnaire extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => [String])
    @Prop()
    name: string;

    @Field(() => String)
    @Prop()
    language: string;

    @Field(() => String)
    @Prop()
    abbreviation: string;

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
    @Prop({ type: QuestionGroupSchema })
    questionGroups: QuestionGroup[] = [];
}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);
