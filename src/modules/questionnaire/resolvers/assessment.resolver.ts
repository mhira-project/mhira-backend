import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import {
    AnswerAssessmentInput,
    CreateQuestionnaireAssessmentInput,
} from '../dtos/assessment.input';
import { QuestionnaireAssessment } from '../models/questionnaire-assessment.schema';
import { AssessmentService } from '../services/assessment.service';

@Resolver(() => QuestionnaireAssessment)
export class AssessmentResolver {
    constructor(private assessmentService: AssessmentService) {}

    @Mutation(() => QuestionnaireAssessment)
    addAnswer(
        @Args('assessment') assessmentInput: AnswerAssessmentInput,
    ): Promise<QuestionnaireAssessment> {
        return this.assessmentService.addAnswerToAssessment(assessmentInput);
    }

    @Mutation(() => QuestionnaireAssessment)
    createNewAssessment(
        @Args('assessment') assessmentInput: CreateQuestionnaireAssessmentInput,
    ) {
        return this.assessmentService.createNewAssessment(assessmentInput);
    }

    @Mutation(() => QuestionnaireAssessment)
    deleteAssessment(_id: Types.ObjectId) {
        return this.assessmentService.deleteAssessment(_id);
    }
}
