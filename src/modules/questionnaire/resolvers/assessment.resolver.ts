import { Logger } from '@nestjs/common';
import {
    Args,
    Mutation,
    Parent,
    ResolveField,
    Resolver,
} from '@nestjs/graphql';
import {
    AnswerAssessmentInput,
    ChangeAssessmentStatusInput,
} from '../dtos/assessment.input';
import { QuestionnaireAssessment } from '../models/questionnaire-assessment.schema';
import { Questionnaire } from '../models/questionnaire.schema';
import { QuestionnaireAssessmentService } from '../services/questionnaire-assessment.service';
import { AssessmentStatus } from '../enums/assessment-status.enum';

@Resolver(() => QuestionnaireAssessment)
export class AssessmentResolver {
    private readonly logger = new Logger(AssessmentResolver.name);

    constructor(private assessmentService: QuestionnaireAssessmentService) {}

    @Mutation(() => QuestionnaireAssessment)
    async addAnswer(
        @Args('assessment') assessmentInput: AnswerAssessmentInput,
    ): Promise<QuestionnaireAssessment> {
        // The status change is awaited before the answer's save loads the
        // document, so the two saves no longer race (BUGS.md, B02). As
        // before, it comes first, also for an answer that is then refused,
        // and a failed status change is logged and dropped without stopping
        // the answer.
        await this.assessmentService
            .changeAssessmentStatus(
                assessmentInput.assessmentId,
                AssessmentStatus.PARTIALLY_COMPLETED,
            )
            .catch((error: unknown) =>
                this.logger.error(
                    `addAnswer: the status change to PARTIALLY_COMPLETED of assessment ${assessmentInput.assessmentId} failed and was dropped (B02)`,
                    error instanceof Error ? error.stack : String(error),
                ),
            );
        return this.assessmentService.addAnswerToAssessment(assessmentInput);
    }

    @Mutation(() => QuestionnaireAssessment)
    changeAssessmentStatus(
        @Args('statusInput')
        { assessmentId, status }: ChangeAssessmentStatusInput,
    ): Promise<QuestionnaireAssessment> {
        return this.assessmentService.changeAssessmentStatus(
            assessmentId,
            status,
        );
    }

    @ResolveField()
    async questionnaires(
        @Parent() assessment: QuestionnaireAssessment,
        @Args('populate') populate: boolean,
    ) {
        if (populate)
            await assessment
                .populate({
                    path: 'questionnaires',
                    model: Questionnaire.name,
                })
                .execPopulate();

        return assessment.questionnaires;
    }
}
