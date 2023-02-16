import { Args, Resolver, Query, Mutation, ArgsType } from '@nestjs/graphql';

import {
    CreateQuestionnaireInput,
    UpdateQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { QuestionnaireService } from '../services/questionnaire.service';
import { Questionnaire } from '../models/questionnaire.schema';
import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
import { Types } from 'mongoose';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { QueryArgsType } from '@nestjs-query/query-graphql';
import { QuestionnaireVersionService } from '../services/questionnaire-version.service';
import { SortDirection } from '@nestjs-query/core';

@ArgsType()
export class QuestionniareVersionQuery extends QueryArgsType(
    QuestionnaireVersion,
) {}
const QuestionnaireVersionConnection = QuestionniareVersionQuery.ConnectionType;

@Resolver(() => Questionnaire)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class QuestionnaireResolver {
    constructor(
        private questionnaireService: QuestionnaireService,
        private questionnaireVersionService: QuestionnaireVersionService,
    ) {}

    @Query(() => Questionnaire)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
    getQuestionnaire(
        @Args('_id', { type: () => String }) questionnaireId: Types.ObjectId,
    ): Promise<Questionnaire> {
        return this.questionnaireService.getById(questionnaireId);
    }

    @Query(() => QuestionnaireVersion)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
    getQuestionnaireVersion(
        @Args('_id', { type: () => String }) questionnaireId: Types.ObjectId,
    ): Promise<QuestionnaireVersion> {
        return this.questionnaireVersionService.getById(questionnaireId);
    }

    @Query(() => QuestionnaireVersionConnection)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
    async getQuestionnaireVersions(@Args() query: QuestionniareVersionQuery) {
        const result = await QuestionnaireVersionConnection.createFromPromise(
            q => this.questionnaireVersionService.getAllVersions(q),
            query,
        );
        return result;
    }

    @Query(() => QuestionnaireVersion)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
    NewestQuestionnaireVersion(
        @Args('_id', { type: () => String }) questionnaireId: string,
    ): Promise<QuestionnaireVersion> {
        const _id = Types.ObjectId(questionnaireId);

        // FIXME: it shouldn't need to be transformed but without doing so it wont work...

        return this.questionnaireService.getNewestVersionById(_id);
    }

    @Query(() => QuestionnaireVersionConnection)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
    async questionnaires(@Args() query: QuestionniareVersionQuery) {
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: '_id', direction: SortDirection.DESC }];

        const result = await QuestionnaireVersionConnection.createFromPromise(
            q => this.questionnaireService.list(q),
            query,
        );
        return result;
    }

    @Mutation(() => QuestionnaireVersion)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    async createQuestionnaire(
        @Args('xlsForm', { type: () => CreateQuestionnaireInput })
        xlsForm: CreateQuestionnaireInput,
    ): Promise<QuestionnaireVersion> {
        return this.questionnaireService.create(xlsForm);
    }

    @Mutation(() => QuestionnaireVersion)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    async updateQuestionnaire(
        @Args('_id', { type: () => String })
        id: Types.ObjectId,

        @Args('xlsForm', { type: () => UpdateQuestionnaireInput })
        xlsForm: UpdateQuestionnaireInput,
    ): Promise<QuestionnaireVersion> {
        return this.questionnaireService.updateOne(id, xlsForm);
    }

    @Mutation(() => Questionnaire)
    @UsePermission(PermissionEnum.DELETE_QUESTIONNAIRES)
    async deleteQuestionnaire(
        @Args('_id', { type: () => String }) questionnaireId: string,
        @Args('softDelete', { type: () => Boolean, defaultValue: true })
        softDelete: boolean,
    ) {
        const _id = Types.ObjectId(questionnaireId);
        return this.questionnaireService.deleteQuestionnaire(_id, softDelete);
    }
}
