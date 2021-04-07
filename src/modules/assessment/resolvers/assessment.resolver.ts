import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Int, Args, Mutation } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { Assessment, FullAssessment } from '../models/assessment.model';
import { AssessmentService } from '../services/assessment.service';
import { AssessmentService as QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/assessment.service';
import {
    CreateFullAssessmentInput,
    UpdateFullAssessmentInput,
} from '../dtos/create-assessment.input';

@Resolver(() => Assessment)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class AssessmentResolver {
    constructor(
        private readonly assessmentService: AssessmentService,
        private readonly questionnaireAssessmentService: QuestionnaireAssessmentService,
    ) {}

    @Query(() => FullAssessment)
    GetFullAssessment(
        @Args('id', { type: () => Int }) assessmentId: number,
    ): Promise<FullAssessment> {
        return this.assessmentService.getFullAssessment(assessmentId);
    }

    @Mutation(() => Assessment)
    async createNewAssessment(
        @Args('assessment') assessmentInput: CreateFullAssessmentInput,
    ) {
        const session = await this.assessmentService.createNewTransaction();

        const questionnaireAssessment = await this.questionnaireAssessmentService.createNewAssessment(
            assessmentInput.questionnaires,
        );

        return this.assessmentService
            .createNewAssessment(assessmentInput, questionnaireAssessment)
            .save()
            .then(assessment => {
                session.commitTransaction();
                session.endSession();

                return assessment;
            })
            .catch(async err => {
                session.abortTransaction();
                session.endSession();
                throw err;
            });
    }

    @Mutation(() => Assessment)
    async updateAssessment(
        @Args('assessment') assessmentInput: UpdateFullAssessmentInput,
    ) {
        return this.assessmentService.updateAssessment(assessmentInput);
    }
}
