import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@ObjectType()
@Schema({ collection: 'questionnaires', timestamps: {} })
export class Questionnaire extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop()
    language: string;

    @Field(() => String)
    @Prop()
    abbreviation: string;
}

export const QuestionnaireSchema = SchemaFactory.createForClass(
    Questionnaire,
).index({ language: 1, abbreviation: 1 }, { unique: true }); // index to ensure that translations for the same questionnaire can be uploaded
