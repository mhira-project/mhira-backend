import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from './answer.schema';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Questionnaire } from './questionnaire.schema';
import { AssessmentStatus } from '../enums/assessment-status.enum';
import { QuestionnaireBundle } from './questionnaire-bundle.schema';

@ObjectType()
@Schema({ collection: 'assessments', timestamps: true })
export class QuestionnaireAssessment extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => Date)
    @Prop()
    assessmentDate: Date;

    @Field(() => String)
    @Prop({
        type: 'string',
        enum: Object.values(AssessmentStatus),
        default: AssessmentStatus.PLANNED,
    })
    status: AssessmentStatus;

    @Field(() => [Questionnaire])
    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: Questionnaire.name })
    questionnaires: Types.ObjectId[] | Questionnaire[];

    @Field(() => [QuestionnaireBundle])
    @Prop({
        type: [MongooseSchema.Types.ObjectId],
        ref: QuestionnaireBundle.name,
    })
    questionnaireBundles: Types.ObjectId[] | QuestionnaireBundle[];

    @Field(() => [Answer])
    @Prop({ type: [AnswerSchema] })
    answers: Answer[];
}

export const AssessmentSchema = SchemaFactory.createForClass(
    QuestionnaireAssessment,
);
