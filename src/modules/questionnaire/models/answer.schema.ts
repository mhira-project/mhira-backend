import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { AnsweredQuestions } from './questionnaire.schema';

@ObjectType()
@Schema({ timestamps: true })
export class Answer extends Document {
    // Both are stored as they come: every answer in the seed holds
    // `question` as a string and no `_id`, and an existing answer is found
    // by comparing `question` as a string. Declared Mixed because that is
    // what @nestjs/mongoose has always made of the bare Types.ObjectId
    // here; an ObjectId cast would append a second answer instead of
    // replacing it (BUGS.md, B04). Nothing populates `question`.
    @Field(() => String)
    @Prop({ type: MongooseSchema.Types.Mixed })
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop({ type: MongooseSchema.Types.Mixed })
    question: Types.ObjectId;

    @Field(() => Boolean, { nullable: true })
    @Prop()
    valid: boolean;

    @Field(() => String, { nullable: true })
    @Prop()
    textValue: string;

    @Field(() => [String], { nullable: true })
    @Prop()
    multipleChoiceValue: string[];

    @Field(() => Number, { nullable: true })
    @Prop()
    numberValue: number;

    @Field(() => Date, { nullable: true })
    @Prop()
    dateValue: Date;

    @Field(() => Boolean, { nullable: true })
    @Prop()
    booleanValue: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

export interface IAnswerMap {
    [key: string]: AnsweredQuestions;
}
