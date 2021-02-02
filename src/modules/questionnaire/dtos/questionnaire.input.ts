import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { Upload } from '../types/upload.type';

@InputType()
export class CreateQuestionnaireInput {
    @Field(() => Upload)
    xlsForm: Upload;
}

@ArgsType()
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
    //questionGroups?: Types.ObjectId[];
}

export class UpdateQuestionnaireInput extends ListQuestionnaireInput {
    copyright?: string;
}
