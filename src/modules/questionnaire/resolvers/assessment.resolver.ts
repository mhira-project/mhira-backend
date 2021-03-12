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
} from '../dtos/assessment.input';
import { QuestionnaireAssessment } from '../models/questionnaire-assessment.schema';
import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
import { AssessmentService } from '../services/assessment.service';

@Resolver(() => QuestionnaireAssessment)
export class AssessmentResolver {
    constructor(private assessmentService: AssessmentService) {}

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

    @ResolveField()
    async questionnaires(
        @Parent() assessment: QuestionnaireAssessment,
        @Args('populate') populate: boolean,
    ) {
        if (populate)
            await assessment
                .populate({
                    path: 'questionnaires',
                    model: QuestionnaireVersion.name,
                })
                .execPopulate();

        return assessment.questionnaires;
    }
}
