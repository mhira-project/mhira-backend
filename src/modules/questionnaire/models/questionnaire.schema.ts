import { QuestionGroup } from './question-group.schema';
import { Translation } from './translation.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ collection: 'questionnaires' })
export class Questionnaire extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => [String])
    @Prop({ type: [Types.ObjectId], ref: Translation.name })
    name: Types.ObjectId[];

    @Field(() => String)
    @Prop()
    languages: string;

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

    /* @Field(() => [QuestionGroup])
    @Prop({ type: [Types.ObjectId], ref: QuestionGroup.name })
    questionGroups: QuestionGroup[];*/
}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);
