import { Field, InputType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { GraphQLUpload } from 'graphql-tools';
import { FileUpload } from 'graphql-upload';
import { QuestionnaireStatus } from '../models/questionnaire-version.schema';

@InputType()
class SharedQuestionnaireInput {
    @Field(() => String, { nullable: false })
    language: string;

    @Field(() => Number, { nullable: true })
    timeToComplete: number;

    @Field(() => String, { nullable: true })
    license?: string;

    @Field(() => String, { nullable: false })
    copyright: string;

    @Field(() => String, { nullable: true })
    website?: string;

    @Field(() => [String], { nullable: true })
    keywords?: string[];

    @Field(() => String, {
        nullable: true,
        defaultValue: QuestionnaireStatus.DRAFT,
    })
    status: QuestionnaireStatus;
}

@InputType()
export class UpdateQuestionnaireInput extends SharedQuestionnaireInput {
    @Field(() => String, { nullable: false })
    name: string;
}

@InputType()
export class CreateQuestionnaireInput extends SharedQuestionnaireInput {
    @Field(() => String, { nullable: true })
    name: string;

    @Field(() => GraphQLUpload)
    @Exclude()
    excelFile: Promise<FileUpload>;
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
    status?: string;
}
