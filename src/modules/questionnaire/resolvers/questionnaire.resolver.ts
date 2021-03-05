import {
    Args,
    Resolver,
    Query,
    Mutation,
    ResolveField,
    Parent,
} from '@nestjs/graphql';

import {
    CreateQuestionnaireInput,
    CreateRawQuestionnaireInput,
    ListQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { QuestionnaireService } from '../services/questionnaire.service';
import { Questionnaire } from '../models/questionnaire.schema';
import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
import { Types } from 'mongoose';

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
    createQuestionnaireWithFile(
        @Args('input') questionnaireInput: CreateQuestionnaireInput,
    ): Promise<Questionnaire> {
        return this.questionnaireService.create(questionnaireInput);
    }

    @Mutation(() => Questionnaire)
    async createRawQuestionnaire(
        @Args('payload') questionnaireInput: CreateRawQuestionnaireInput,
    ) {
        return this.questionnaireService.createRaw(questionnaireInput);
    }

    @Mutation(() => Questionnaire)
    async deleteQuestionnaire(
        @Args('_id', { type: () => String }) _id: Types.ObjectId,
    ) {
        return this.questionnaireService.delete(_id);
    }

    /*  @Mutation(() => Questionnaire)
    async updateQuestionnaire(
        @Args('payload') payload: UpdateQuestionnaireInput,
    ) {
        this.questionnaireService.update(payload);
    }

*/
}
