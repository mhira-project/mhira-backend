import { FilterableField } from "@nestjs-query/query-graphql";
import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { QuestionnaireVersion } from "./questionnaire-version.schema";

@ObjectType()
@Schema({ collection: "questionnaire_bundle", timestamps: true })
export class QuestionnaireBundle extends Document {
    @Field(() => String)
    _id: Types.ObjectId

    @FilterableField(() => String)
    @Prop({ type: 'string' })
    name: string;

    @Field(() => [QuestionnaireVersion])
    @Prop({ type: [Types.ObjectId], ref: QuestionnaireVersion.name })
    questionnaires: Types.ObjectId[] | QuestionnaireVersion[];

    @FilterableField(() => Date)
    @Prop()
    createdAt: Date;

    @Field(() => Date)
    @Prop()
    updatedAt: Date;
}

export const QuestionnaireBundleSchema = SchemaFactory.createForClass(QuestionnaireBundle);