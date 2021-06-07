import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Int, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql';
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

@Resolver(() => Assessment)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class AssessmentResolver {
    constructor(
        private readonly assessmentService: AssessmentService,
    ) { }

    @ResolveField('questionnaireAssessment', () => QuestionnaireAssessment)
    getQuestionnaireAssessment(@Parent() assessment: Assessment) {
        return this.assessmentService.getQuestionnaireAssessment(assessment.questionnaireAssessmentId);
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
    async deleteAssessment(@Args('id', { type: () => Int }) id: number, @Args('archive', { nullable: true, defaultValue: true }) archive: boolean) {
        await this.assessmentService.deleteAssessment(id, archive);
        return archive;
    }

}
