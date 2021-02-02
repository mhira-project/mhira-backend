import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { QuestionGroup } from '../models/question-group.model';
import { Upload } from '../types/upload.type';

@InputType()
export class CreateQuestionnaireInput {
    @Field()
    xlsForm: Upload;
}

export class ListQuestionnaireInput {
    _id?: Types.ObjectId;
    name?: string;
    languages?: string;
    abbreviation?: string;
    license?: string;
    timeToComplete?: number;
    questionGroups: QuestionGroup[];
}
