import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { Upload } from '../types/upload.type';

@InputType()
export class CreateQuestionnaireInput {
    @Field(() => Upload)
    @IsOptional()
    xlsForm: Upload;
}

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
    languages?: string;

    @Field({ nullable: true })
    @IsOptional()
    abbreviation?: string;

    @Field({ nullable: true })
    @IsOptional()
    license?: string;

    @Field({ nullable: true })
    @IsOptional()
    timeToComplete?: number;
}

export class UpdateQuestionnaireInput extends ListQuestionnaireInput {
    copyright?: string;
}
