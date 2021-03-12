import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';

import {
    CreateRawQuestionnaireInput,
    ListQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { QuestionnaireService } from '../services/questionnaire.service';
import { Questionnaire } from '../models/questionnaire.schema';
import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
import { Types } from 'mongoose';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@Resolver(() => Questionnaire)
export class QuestionnaireResolver {
    constructor(private questionnaireService: QuestionnaireService) {}

    @Query(() => Questionnaire)
    getQuestionnaire(
        @Args('_id', { type: () => String }) questionnaireId: Types.ObjectId,
    ): Promise<Questionnaire> {
        return this.questionnaireService.getById(questionnaireId);
    }

    @Query(() => QuestionnaireVersion)
    NewestQuestionnaireVersion(
        @Args('_id', { type: () => String }) questionnaireId: Types.ObjectId,
    ): Promise<QuestionnaireVersion> {
        return this.questionnaireService.getNewestVersionById(questionnaireId);
    }

    @Query(() => [QuestionnaireVersion])
    async questionnaires(
        @Args('filters') questionnaireFilter: ListQuestionnaireInput,
    ) {
        return this.questionnaireService.list(questionnaireFilter);
    }

    @Mutation(() => Questionnaire)
    async createQuestionnaireWithFile(
        @Args('xlsForm', { type: () => GraphQLUpload })
        xlsForm: FileUpload,
    ): Promise<Questionnaire> {
        return this.questionnaireService.create(xlsForm);
    }

    @Mutation(() => Questionnaire)
    async deleteQuestionnaire(
        @Args('_id', { type: () => String }) _id: Types.ObjectId,
    ) {
        return this.questionnaireService.delete(_id);
    }
}
