import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { QuestionnaireStatus } from '../models/questionnaire-version.schema';

@InputType()
export class CreateRawQuestionnaireInput {
    @Field(() => String)
    name: string;

    @Field(() => Number)
    timeToComplete: number;

    @Field(() => String)
    language: string;

    @Field(() => String)
    license: string;

    @Field(() => String)
    copyright: string;

    @Field(() => String)
    abbreviation: string;
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
