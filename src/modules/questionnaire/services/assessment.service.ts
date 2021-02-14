import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    AnswerAssessmentInput,
    CreateAssessmentInput,
} from '../dtos/assessment.input';
import { Answer } from '../models/answer.schema';
import { Assessment, AssessmentStatus } from '../models/assessment.schema';

export class AssessmentService {
    constructor(
        @InjectModel(Assessment.name)
        private assessmentModel: Model<Assessment>,
        @InjectModel(Answer.name)
        private answerModel: Model<Answer>,
    ) {}

    createNewAssessment(assessmentInput: CreateAssessmentInput) {
        return this.assessmentModel.create(assessmentInput);
    }

    createAnswersQuestionnaire(assessmentAnswerInput: AnswerAssessmentInput) {
        const status = assessmentAnswerInput.finishedAssessment
            ? AssessmentStatus.COMPLETED
            : AssessmentStatus.PARTIALLY_COMPLETED;

        // TODO: go through each answer and validate with the question

        return this.assessmentModel
            .findByIdAndUpdate(assessmentAnswerInput.assessmentId, {
                status: status,
                updatedAt: new Date(),
                answers: assessmentAnswerInput.answers,
            })
            .exec();
    }

    deleteAssessment(_id: Types.ObjectId, archive: boolean = true) {
        var assessmentQuery = archive
            ? this.assessmentModel.findByIdAndUpdate(_id, {
                  status: AssessmentStatus.ARCHIVED,
              })
            : this.assessmentModel.findByIdAndDelete(_id);

        return assessmentQuery.exec();
    }
}
