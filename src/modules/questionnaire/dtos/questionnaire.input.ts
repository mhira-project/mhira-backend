import { Field, InputType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { QuestionnaireStatus } from '../models/questionnaire.schema';

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

    @Field(() => String, { nullable: true })
    description: string;
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
