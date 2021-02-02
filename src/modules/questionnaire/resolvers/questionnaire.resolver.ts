import { Args, Parent, Resolver, Query, Mutation } from '@nestjs/graphql';
import { QuestionGroup } from '../models/question-group.schema';
import { Questionnaire } from '../models/questionnaire.schema';

import {
    CreateQuestionnaireInput,
    ListQuestionnaireInput,
    UpdateQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { QuestionnaireService } from '../services/questionnaire.service';
import { Types } from 'mongoose';

@Resolver(() => Questionnaire)
export class QuestionnaireResolver {
    constructor(private questionnaireService: QuestionnaireService) {}

    @Query(() => [Questionnaire])
    async questionnaires(@Args() questionnaireFilter: ListQuestionnaireInput) {
        return this.questionnaireService.list(questionnaireFilter);
    }

    /* async questionGroups(
        @Parent() questionnaire: Questionnaire,
        @Args('populate') populate: boolean,
    ) {
        if (populate) {
            await questionnaire
                .populate({
                    path: 'questionGroups',
                    model: QuestionGroup.name,
                })
                .execPopulate();

            return questionnaire.questionGroups;
        }
    }*/

    @Mutation(() => Questionnaire, {
        deprecationReason: 'Replaced with `createOneUser` mutation',
    })
    createQuestionnaireWithFile(
        @Args('input') questionnaireInput: CreateQuestionnaireInput,
    ): Promise<Questionnaire> {
        return this.questionnaireService.create(questionnaireInput);
    }

    /*  @Mutation(() => Questionnaire)
    async createQuestionnaire(
        @Args('payload') payload: CreateQuestionnaireInput,
    ) {
        return this.questionnaireService.create(payload);
    }*/

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
