import { QueryArgsType } from '@nestjs-query/query-graphql';
import { Args, ArgsType, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { QuestionnaireBundle } from '../models/questionnaire-bundle.schema';
import { QuestionnaireBundleService } from '../services/questionnaire-bundle.service';
import { SortDirection } from '@nestjs-query/core';
import { CreateQuestionnaireBundleInput, UpdateQuestionnaireBundleInput } from '../dtos/questionnaire-bundle.input';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { User } from 'src/modules/user/models/user.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';

@ArgsType()
export class QuestionniareBundleQuery extends QueryArgsType(
    QuestionnaireBundle,
) {}
const QuestionnaireBundleConnection = QuestionniareBundleQuery.ConnectionType;

@Resolver(() => QuestionnaireBundle)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class QuestionnaireBundleResolver {
    constructor(
        private questionnaireBundleService: QuestionnaireBundleService,
    ) {}

    @Query(() => QuestionnaireBundle)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRE_BUNDLES)
    getQuestionnaireBundle(
        @Args('_id', { type: () => String })
        questionnaireBundleId: Types.ObjectId,
    ): Promise<QuestionnaireBundle> {
        return this.questionnaireBundleService.getById(questionnaireBundleId);
    }

    @Query(() => QuestionnaireBundleConnection)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRE_BUNDLES)
    async getQuestionnaireBundles(
        @Args() query: QuestionniareBundleQuery,
        @Args('departmentIds', { type: () => [Number], nullable: true })
        departmentIds: number[],
    ) {
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: '_id', direction: SortDirection.DESC }];

        const result = await QuestionnaireBundleConnection.createFromPromise(
            q => this.questionnaireBundleService.list(q, departmentIds),
            query,
        );
        return result;
    }

    @Mutation(() => QuestionnaireBundle)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRE_BUNDLES)
    createQuestionnaireBundle(
        @Args('input') input: CreateQuestionnaireBundleInput,
        @CurrentUser() currentUser: User,
    ) {
        return this.questionnaireBundleService.createQuestionnaireBundle(
            input,
            currentUser,
        );
    }

    @Mutation(() => QuestionnaireBundle)
    @UsePermission(PermissionEnum.DELETE_QUESTIONNAIRE_BUNDLES)
    deleteQuestionnaireBundle(@Args('_id', { type: () => String }) id: string) {
        return this.questionnaireBundleService.deleteQuestionnaireBundle(id);
    }

    @Mutation(() => QuestionnaireBundle)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    updateQuestionnaireBundle(@Args('input') input: UpdateQuestionnaireBundleInput) {
        return this.questionnaireBundleService.updateQuestionnaireBundle(input)
    }
}