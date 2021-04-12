import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';

import {
    CreateQuestionnaireInput,
    ListQuestionnaireInput,
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

@Resolver(() => Questionnaire)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class QuestionnaireResolver {
    constructor(private questionnaireService: QuestionnaireService) {}

    @Query(() => Questionnaire)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
    getQuestionnaire(
        @Args('_id', { type: () => String }) questionnaireId: Types.ObjectId,
    ): Promise<Questionnaire> {
        return this.questionnaireService.getById(questionnaireId);
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

    @Query(() => [QuestionnaireVersion])
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
    async questionnaires(
        @Args('filters') questionnaireFilter: ListQuestionnaireInput,
    ) {
        return this.questionnaireService.list(questionnaireFilter);
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
