import { QueryArgsType } from '@nestjs-query/query-graphql';
import { Args, ArgsType, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { QuestionnaireBundle } from '../models/questionnaire-bundle.schema';
import { QuestionnaireBundleService } from '../services/questionnaire-bundle.service';
import { SortDirection } from '@nestjs-query/core';
import { CreateQuestionnaireBundleInput, UpdateQuestionnaireBundleInput } from '../dtos/questionnaire-bundle.input';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';

@ArgsType()
export class QuestionniareBundleQuery extends QueryArgsType(
    QuestionnaireBundle,
) {}
const QuestionnaireBundleConnection = QuestionniareBundleQuery.ConnectionType;

@Resolver(() => QuestionnaireBundle)
export class QuestionnaireBundleResolver {
    constructor(
        private questionnaireBundleService: QuestionnaireBundleService,
    ) {}

    @Query(() => QuestionnaireBundle)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
    getQuestionnaireBundle(
        @Args('_id', { type: () => String })
        questionnaireBundleId: Types.ObjectId,
    ): Promise<QuestionnaireBundle> {
        return this.questionnaireBundleService.getById(questionnaireBundleId);
    }

    @Query(() => QuestionnaireBundleConnection)
    async getQuestionnaireBundles(@Args() query: QuestionniareBundleQuery) {
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: '_id', direction: SortDirection.DESC }];

        const result = await QuestionnaireBundleConnection.createFromPromise(
            q => this.questionnaireBundleService.list(q),
            query,
        );
        return result;
    }

    @Mutation(() => QuestionnaireBundle)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    createQuestionnaireBundle(
        @Args('input') input: CreateQuestionnaireBundleInput,
    ) {
        return this.questionnaireBundleService.createQuestionnaireBundle(input);
    }

    @Mutation(() => QuestionnaireBundle)
    @UsePermission(PermissionEnum.DELETE_QUESTIONNAIRES)
    deleteQuestionnaireBundle(@Args('_id', { type: () => String }) id: string) {
        return this.questionnaireBundleService.deleteQuestionnaireBundle(id);
    }

    @Mutation(() => QuestionnaireBundle)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    updateQuestionnaireBundle(@Args('input') input: UpdateQuestionnaireBundleInput) {
        return this.questionnaireBundleService.updateQuestionnaireBundle(input)
    }
}