import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { FilterableField } from '@nestjs-query/query-graphql';

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
QuestionnaireSchema.virtual('questionnaireVersions', {
    ref: 'questionnaireversion',
    localField: '_id',
    foreignField: 'questionnaire',
});