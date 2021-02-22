import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

    @Field(() => String)
    @Prop()
    textValue: string;

    @Field(() => [String])
    @Prop()
    multipleChoiceValue: string[];

    @Field(() => Number)
    @Prop()
    numberValue: number;

    @Field(() => Date)
    @Prop()
    dateValue: Date;

    @Field(() => Boolean)
    @Prop()
    booleanValue: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
