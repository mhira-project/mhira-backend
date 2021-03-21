import { Field, InputType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { GraphQLUpload } from 'graphql-tools';
import { FileUpload } from 'graphql-upload';
import { QuestionnaireStatus } from '../models/questionnaire-version.schema';

@InputType()
export class UpdateQuestionnaireInput {
    @Field(() => String, { nullable: false })
    language: string;

    @Field(() => String, { nullable: true })
    name: string;

    @Field(() => Number, { nullable: false })
    timeToComplete: number;

    @Field(() => String, { nullable: true })
    license?: string;

    @Field(() => String, { nullable: false })
    copyright: string;

    @Field(() => String, { nullable: true })
    website?: string;

    @Field(() => String, {
        nullable: true,
        defaultValue: QuestionnaireStatus.DRAFT,
    })
    status: string;
}

@InputType()
export class CreateQuestionnaireInput extends UpdateQuestionnaireInput {
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
