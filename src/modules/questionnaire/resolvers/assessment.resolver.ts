import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import {
    AnswerAssessmentInput,
    CreateAssessmentInput,
} from '../dtos/assessment.input';
import { Assessment } from '../models/assessment.schema';
import { AssessmentService } from '../services/assessment.service';

@Resolver(() => Assessment)
export class AssessmentResolver {
    constructor(private assessmentService: AssessmentService) {}

    @Mutation(() => Assessment)
    addAnswer(
        @Args('assessment') assessmentInput: AnswerAssessmentInput,
    ): Promise<Assessment> {
        return this.assessmentService.addAnswerToAssessment(assessmentInput);
    }

    @Mutation(() => Assessment)
    createNewAssessment(
        @Args('assessment') assessmentInput: CreateAssessmentInput,
    ) {
        return this.assessmentService.createNewAssessment(assessmentInput);
    }

    @Mutation(() => Assessment)
    deleteAssessment(_id: Types.ObjectId) {
        return this.assessmentService.deleteAssessment(_id);
    }
}
