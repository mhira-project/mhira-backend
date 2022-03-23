import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AnsweredQuestions } from './questionnaire.schema';

@ObjectType()
@Schema({ timestamps: true })
export class Answer extends Document {
    @Field(() => String)
    @Prop()
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop({
        type: Types.ObjectId,
        ref: 'questionnaire_versions.questionGroups.questions',
    })
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
