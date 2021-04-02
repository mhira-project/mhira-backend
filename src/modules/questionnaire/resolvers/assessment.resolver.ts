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
import { Assessment, FullAssessment } from '../../assessment/models/assessment.model';
import { Int } from '@nestjs/graphql';
import { UpdateQuestionnaireAssessmentInput } from '../dtos/assessment.input';
import { Questionnaire } from '../models/questionnaire.schema';

@Resolver(() => QuestionnaireAssessment)
export class AssessmentResolver {
    constructor(private assessmentService: AssessmentService) { }

    @Query(() => QuestionnaireAssessment)
    getAssessment(
        @Args('_id', { type: () => String }) assessmentId: Types.ObjectId,
    ): Promise<QuestionnaireAssessment> {
        return this.assessmentService.getById(assessmentId);
    }

    @Query(() => FullAssessment)
    getMongoAssessment(
        @Args('id', { type: () => Int }) assessmentId: number,
    ): Promise<FullAssessment> {
        return this.assessmentService.getFullAssessment(assessmentId);
    }

    @Mutation(() => QuestionnaireAssessment)
    addAnswer(
        @Args('assessment') assessmentInput: AnswerAssessmentInput,
    ): Promise<QuestionnaireAssessment> {
        return this.assessmentService.addAnswerToAssessment(assessmentInput);
    }

    @Mutation(() => Assessment)
    async createNewAssessment(
        @Args('assessment') assessmentInput: CreateQuestionnaireAssessmentInput,
    ) {
        const questionnaireAssessment = await this.assessmentService.createNewAssessment(assessmentInput.questionnaires);
        const assessment = new Assessment();
        assessment.name = assessmentInput.name;
        assessment.patientId = assessmentInput.patientId;
        assessment.clinicianId = assessmentInput.clinicianId;
        assessment.informant = assessmentInput.informant;
        assessment.questionnaireAssessmentId = questionnaireAssessment.id;
        return assessment.save().catch(err => {
            questionnaireAssessment.remove();
            throw err;
        });
    }

    @Mutation(() => Assessment)
    async updateAssessment(
        @Args('assessment') assessmentInput: UpdateQuestionnaireAssessmentInput,
    ) {
        return this.assessmentService.updateAssessment(assessmentInput);
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
                    populate: {
                        path: 'questionnaire',
                        model: Questionnaire.name
                    }
                })
                .execPopulate();

        return assessment.questionnaires;
    }
}
