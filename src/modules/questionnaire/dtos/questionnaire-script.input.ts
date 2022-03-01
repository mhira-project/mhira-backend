import { Field, InputType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { GraphQLUpload, FileUpload } from 'graphql-upload';

@InputType()
export class QuestionnaireScriptInput {
    @Field(() => String)
    name: string;

    @Field(() => GraphQLUpload)
    @Exclude()
    scriptText: Promise<FileUpload>;

    @Field(() => String)
    creator: string;

    @Field(() => String)
    repositoryLink: string;
}
