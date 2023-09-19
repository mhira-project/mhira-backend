import {
    Args,
    Mutation,
    Parent,
    ResolveField,
    Resolver,
    Query,
} from '@nestjs/graphql';
import { Types } from 'mongoose';
import {
    AnswerAssessmentInput,
    CreateQuestionnaireAssessmentInput,
    ChangeAssessmentStatusInput,
} from '../dtos/assessment.input';
import { QuestionnaireAssessment } from '../models/questionnaire-assessment.schema';
import { Questionnaire } from '../models/questionnaire.schema';
import { QuestionnaireAssessmentService } from '../services/questionnaire-assessment.service';
import { AssessmentStatus } from '../enums/assessment-status.enum';

@Resolver(() => QuestionnaireAssessment)
export class AssessmentResolver {
    constructor(private assessmentService: QuestionnaireAssessmentService) {}

    @Query(() => QuestionnaireAssessment)
    getAssessment(
        @Args('_id', { type: () => String }) assessmentId: Types.ObjectId,
    ): Promise<QuestionnaireAssessment> {
        return this.assessmentService.getById(assessmentId);
    }

    @Mutation(() => QuestionnaireAssessment)
    addAnswer(
        @Args('assessment') assessmentInput: AnswerAssessmentInput,
    ): Promise<QuestionnaireAssessment> {
        this.assessmentService.changeAssessmentStatus(
            assessmentInput.assessmentId,
            AssessmentStatus.PARTIALLY_COMPLETED,
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

    @Mutation(() => QuestionnaireAssessment)
    createQuestionnaireAssessment(
        @Args('assessment') assessmentInput: CreateQuestionnaireAssessmentInput,
    ) {
        return this.assessmentService.createNewAssessment(
            assessmentInput.questionnaires,
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
