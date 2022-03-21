import {
    DeleteOneInputType,
    UpdateOneInputType,
} from '@nestjs-query/query-graphql';
import { Field, InputType, Int, OmitType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { QuestionnaireScript } from '../models/questionnaire-script.model';

@InputType()
export class CreateQuestionnaireScriptInput {
    @Field(() => String)
    questionnaireId: string;

    @Field(() => String)
    name: string;

    @Field(() => GraphQLUpload)
    @Exclude()
    scriptText: Promise<FileUpload>;

    @Field(() => String, { nullable: true })
    creator: string;

    @Field(() => String, { nullable: true })
    version: string;

    @Field(() => String, { nullable: true })
    repositoryLink: string;

    @Field(() => [Int])
    reportIds: number[];
}

@InputType()
export class UpdateQuestionnaireScriptFields {
    @Field(() => String, { nullable: true })
    name?: string;

    @Field(() => GraphQLUpload, { nullable: true })
    @Exclude()
    scriptText?: Promise<FileUpload>;

    @Field(() => String, { nullable: true })
    creator?: string;

    @Field(() => String, { nullable: true })
    version?: string;

    @Field(() => String, { nullable: true })
    repositoryLink?: string;

    @Field(() => [Int], { nullable: true })
    reportIds: number[];
}

// Remove fields that we dont need to be updated and keep all the rest
// @InputType()
// export class UpdateQuestionnaireScriptFields extends OmitType(
//     CreateQuestionnaireScriptInput,
//     ['questionnaireId'] as const,
// ) {}

@InputType()
export class UpdateQuestionnaireScriptInput extends UpdateOneInputType(
    QuestionnaireScript,
    UpdateQuestionnaireScriptFields,
) {}

@InputType()
export class DeleteQuestionnaireScriptInput extends DeleteOneInputType(
    QuestionnaireScript,
) {}
