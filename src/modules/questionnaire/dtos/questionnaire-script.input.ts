import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { GraphQLUpload, FileUpload } from 'graphql-upload';

@InputType()
export class CreateQuestionnaireScriptInput {
    @Field(() => String)
    name: string;

    @Field(() => GraphQLUpload)
    @Exclude()
    scriptText: Promise<FileUpload>;

    @Field(() => String, { nullable: true })
    creator: string;

    @Field(() => String, { nullable: true })
    repositoryLink: string;

    @Field(() => [Int])
    reportIds: number[];
}

@InputType()
export class UpdateQuestionnaireScriptInput extends PartialType(
    CreateQuestionnaireScriptInput,
) {
    @Field(() => Int)
    id: number;
}
