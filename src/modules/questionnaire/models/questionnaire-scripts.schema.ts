import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@ObjectType()
@Schema({ collection: 'questionnaire_scripts', timestamps: true })
export class QuestionnaireScripts extends Document {
    @Field(() => String)
    _id: Types.ObjectId;

    @Field(() => String)
    @Prop()
    name: string;

    @Field(() => String)
    @Prop()
    version: string;

    @Field(() => String)
    @Prop()
    creator: string;

    @Field(() => String)
    @Prop()
    scriptText: string;

    @Field(() => String)
    @Prop()
    repositoryLink: string;
}

export const QuestionnaireScriptsSchema = SchemaFactory.createForClass(
    QuestionnaireScripts,
);
