import { Args, Resolver, Query, Mutation, ArgsType } from '@nestjs/graphql';

import {
    CreateQuestionnaireInput,
    UpdateQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { QuestionnaireService } from '../services/questionnaire.service';
import { Questionnaire } from '../models/questionnaire.schema';
import { Types } from 'mongoose';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { QueryArgsType } from '@nestjs-query/query-graphql';
import { SortDirection } from '@nestjs-query/core';

@ArgsType()
export class QuestionniareQuery extends QueryArgsType(Questionnaire) {}
const QuestionnaireConnection = QuestionniareQuery.ConnectionType;

@Resolver(() => Questionnaire)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class QuestionnaireResolver {
    constructor(private questionnaireService: QuestionnaireService) {}

    @Query(() => Questionnaire)
    getQuestionnaire(
        @Args('_id', { type: () => String }) questionnaireId: Types.ObjectId,
    ): Promise<Questionnaire> {
        return this.questionnaireService.getById(questionnaireId);
    }

    @Query(() => Questionnaire)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
    getQuestionnaireVersion(
        @Args('_id', { type: () => String }) questionnaireId: Types.ObjectId,
    ): Promise<Questionnaire> {
        return this.questionnaireService.getById(
            questionnaireId,
        );
    }

    @Query(() => QuestionnaireConnection)
    async questionnaires(@Args() query: QuestionniareQuery) {
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: '_id', direction: SortDirection.DESC }];

        const result = await QuestionnaireConnection.createFromPromise(
            q => this.questionnaireService.list(q),
            query,
        );
        return result;
    }

    @Mutation(() => Questionnaire)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    async createQuestionnaire(
        @Args('xlsForm', { type: () => CreateQuestionnaireInput })
        xlsForm: CreateQuestionnaireInput,
    ): Promise<Questionnaire> {
        return this.questionnaireService.create(xlsForm);
    }

    @Mutation(() => Questionnaire)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    async updateQuestionnaire(
        @Args('_id', { type: () => String })
        id: Types.ObjectId,

        @Args('xlsForm', { type: () => UpdateQuestionnaireInput })
        xlsForm: UpdateQuestionnaireInput,
    ): Promise<Questionnaire> {
        return this.questionnaireService.updateOne(id, xlsForm);
    }

    @Mutation(() => Questionnaire)
    @UsePermission(PermissionEnum.DELETE_QUESTIONNAIRES)
    async deleteQuestionnaire(
        @Args('_id', { type: () => String }) questionnaireId: string,
    ) {
        const _id = Types.ObjectId(questionnaireId);
        return this.questionnaireService.deleteQuestionnaire(_id);
    }
}
