import { Args, Parent, Resolver, Query, Mutation } from '@nestjs/graphql';
import { QuestionGroup } from '../models/question-group.schema';

import {
    CreateQuestionnaireInput,
    CreateRawQuestionnaireInput,
    ListQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { QuestionnaireService } from '../services/questionnaire.service';
import { Questionnaire } from '../models/questionnaire.schema';

@Resolver(() => Questionnaire)
export class QuestionnaireResolver {
    constructor(private questionnaireService: QuestionnaireService) {}

    @Query(() => Questionnaire)
    questionnaire(@Args('id') questionnaireId: String): Promise<Questionnaire> {
        let mongoose = require('mongoose');
        let objectId = mongoose.Types.ObjectId(questionnaireId);
        return this.questionnaireService.getById(objectId);
    }

    @Query(() => [Questionnaire])
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

    /*  @Mutation(() => Questionnaire)
    async updateQuestionnaire(
        @Args('payload') payload: UpdateQuestionnaireInput,
    ) {
        this.questionnaireService.update(payload);
    }

    @Mutation(() => Questionnaire)
    async deleteQuestionnaire(
        @Args('_id', { type: () => String }) _id: Types.ObjectId,
    ) {
        return this.questionnaireService.delete(_id);
    }*/
}
