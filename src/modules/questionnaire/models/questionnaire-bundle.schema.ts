import { FilterableField } from "@nestjs-query/query-graphql";
import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Questionnaire } from "./questionnaire.schema";

@ObjectType()
@Schema({ collection: "questionnaire_bundle", timestamps: true })
export class QuestionnaireBundle extends Document {
    @Field(() => String)
    _id: Types.ObjectId

    @FilterableField(() => String)
    @Prop({ type: 'string' })
    name: string;

    @Field(() => [Questionnaire])
    @Prop({ type: [Types.ObjectId], ref: Questionnaire.name })
    questionnaires: Types.ObjectId[] | Questionnaire[];

    @Field(() => [Number], { nullable: true })
    @Prop({ type: [Number] })
    departmentIds: number[];

    @Field(() => Number)
    @Prop({ type: Number })
    author: number;

    @FilterableField(() => Date)
    @Prop()
    createdAt: Date;

    @Field(() => Date)
    @Prop()
    updatedAt: Date;

    @Field(() => Boolean, { defaultValue: false })
    @Prop()
    deleted: boolean;
}

export const QuestionnaireBundleSchema = SchemaFactory.createForClass(QuestionnaireBundle);