import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { GraphQLUpload } from 'graphql-tools';
import { FileUpload } from 'graphql-upload';
import { QuestionnaireStatus } from '../models/questionnaire-version.schema';

@InputType()
export class CreateQuestionnaireInput {
    @Field(() => String)
    language: string;

    @Field(() => Number)
    timeToComplete: number;

    @Field(() => String, { nullable: true })
    license: string;

    @Field(() => String)
    copyright: string;

    @Field(() => String, { nullable: true })
    website: string;

    @Field(() => String, { nullable: true })
    status: QuestionnaireStatus.DRAFT;

    @Field(() => GraphQLUpload)
    excelFile: FileUpload;
}

@InputType()
export class ListQuestionnaireInput {
    @Field({ nullable: true })
    @IsOptional()
    language?: string;

    @Field({ nullable: true })
    @IsOptional()
    abbreviation?: string;

    @Field({ nullable: true })
    @IsOptional()
    license?: string;

    @Field({ nullable: true })
    @IsOptional()
    timeToComplete?: number;

    @Field({ nullable: true })
    @IsOptional()
    status?: string = QuestionnaireStatus.PUBLISHED;
}
