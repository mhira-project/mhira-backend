import { UseGuards } from '@nestjs/common';
import {
    Resolver,
    Query,
    Int,
    Args,
    Mutation,
    ResolveField,
    Parent,
    ID,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { Assessment, FullAssessment } from '../models/assessment.model';
import { AssessmentService } from '../services/assessment.service';
import { UsePermission } from '../../permission/decorators/permission.decorator';
import { PermissionEnum } from '../../permission/enums/permission.enum';
import {
    CreateFullAssessmentInput,
    UpdateFullAssessmentInput,
} from '../dtos/create-assessment.input';
import { QuestionnaireAssessment } from '../../questionnaire/models/questionnaire-assessment.schema';
import { ConnectionType } from '@nestjs-query/query-graphql';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { User } from 'src/modules/user/models/user.model';
import {
    AssessmentQuery,
    AssessmentConnection,
} from '../dtos/assessment.query';

@Resolver(() => Assessment)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class AssessmentResolver {
    constructor(private readonly assessmentService: AssessmentService) {}

    @Query(() => AssessmentConnection)
    @UsePermission(PermissionEnum.VIEW_ASSESSMENTS)
    async assessments(
        @Args({ type: () => AssessmentQuery }) query: AssessmentQuery,
        @CurrentUser() currentUser: User,
    ): Promise<ConnectionType<Assessment>> {
        return this.assessmentService.getAssessments(query, currentUser);
    }

    @Query(() => Assessment)
    @UsePermission(PermissionEnum.VIEW_ASSESSMENTS)
    async assessment(
        @Args('id', { type: () => ID }) patientId: number,
        @CurrentUser() currentUser: User,
    ): Promise<Assessment> {
        return this.assessmentService.getAssessment(patientId, currentUser);
    }

    @ResolveField('questionnaireAssessment', () => QuestionnaireAssessment)
    getQuestionnaireAssessment(@Parent() assessment: Assessment) {
        return this.assessmentService.getQuestionnaireAssessment(
            assessment.questionnaireAssessmentId,
        );
    }

    @Query(() => FullAssessment)
    @UsePermission(PermissionEnum.VIEW_ASSESSMENTS)
    getFullAssessment(
        @Args('id', { type: () => Int }) assessmentId: number,
    ): Promise<FullAssessment> {
        return this.assessmentService.getFullAssessment(assessmentId);
    }

    @Mutation(() => Assessment)
    @UsePermission(PermissionEnum.MANAGE_ASSESSMENTS)
    createNewAssessment(
        @Args('assessment') assessmentInput: CreateFullAssessmentInput,
    ) {
        return this.assessmentService.createNewAssessment(assessmentInput);
    }

    @Mutation(() => Assessment)
    @UsePermission(PermissionEnum.MANAGE_ASSESSMENTS)
    updateAssessment(
        @Args('assessment') assessmentInput: UpdateFullAssessmentInput,
    ) {
        return this.assessmentService.updateAssessment(assessmentInput);
    }

    @Mutation(() => Boolean)
    @UsePermission(PermissionEnum.DELETE_ASSESSMENTS)
    async deleteAssessment(
        @Args('id', { type: () => Int }) id: number,
        @Args('statusCancel', { nullable: true, defaultValue: true })
        statusCancel: boolean,
    ) {
        await this.assessmentService.deleteAssessment(id, statusCancel);
        return statusCancel;
    }

    @Mutation(() => Assessment)
    @UsePermission(PermissionEnum.DELETE_ASSESSMENTS)
    async archiveOneAssessment(
        @Args('id', { type: () => Int }) id: number
    ): Promise<Assessment> {
        return await this.assessmentService.archiveOneAssessment(id);
    }

    @Mutation(() => Assessment)
    @UsePermission(PermissionEnum.DELETE_ASSESSMENTS)
    async restoreOneAssessment(
        @Args('id', { type: () => Int }) id: number,
    ): Promise<Assessment> {
        return await this.assessmentService.restoreOneAssessment(id);
    }

}
