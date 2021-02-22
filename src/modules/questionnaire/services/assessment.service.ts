import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    AnswerAssessmentInput,
    CreateAssessmentInput,
} from '../dtos/assessment.input';
import { Answer } from '../models/answer.schema';
import { Assessment, AssessmentStatus } from '../models/assessment.schema';
import { Question, questionType } from '../models/question.schema';

export class AssessmentService {
    constructor(
        @InjectModel(Assessment.name)
        private assessmentModel: Model<Assessment>,
        @InjectModel(Question.name)
        private questionModel: Model<Question>,
        @InjectModel(Answer.name)
        private answerModel: Model<Answer>,
    ) {}

    createNewAssessment(assessmentInput: CreateAssessmentInput) {
        return this.assessmentModel.create(assessmentInput);
    }

    async addAnswerToAssessment(assessmentAnswerInput: AnswerAssessmentInput) {
        const answer = new this.answerModel();

        answer.question = Types.ObjectId(assessmentAnswerInput.question);
        answer.multipleChoiceValue = assessmentAnswerInput.multipleChoiceValue;
        answer.booleanValue = assessmentAnswerInput.booleanValue;
        answer.textValue = assessmentAnswerInput.textValue;
        answer.numberValue = assessmentAnswerInput.numberValue;
        answer.dateValue = assessmentAnswerInput.dateValue;

        this.questionModel
            .findById(assessmentAnswerInput.question)
            .then(question => {
                // TODO: validate, put into a validator
                const valueSet =
                    !!answer.multipleChoiceValue ||
                    !!answer.booleanValue ||
                    !!answer.textValue ||
                    !!answer.numberValue ||
                    !!answer.dateValue;

                if (question.required && !valueSet) {
                    throw new Error('Question is required.');
                }

                if (
                    question.type === questionType.SELECT_MULTIPLE ||
                    question.type === questionType.SELECT_ONE
                ) {
                    const choices = question.choices.map(
                        choice => choice.label,
                    );

                    if (
                        answer.multipleChoiceValue.length < question.min ||
                        answer.multipleChoiceValue.length > question.max
                    ) {
                        throw new Error(
                            `Number of answers must be between ${question.min} and ${question.max}`,
                        );
                    }

                    if (
                        answer.multipleChoiceValue.some(
                            c => !choices.includes(c),
                        )
                    ) {
                        throw new Error(
                            `Please only choose available answers!`,
                        );
                    }
                }
            });

        return this.assessmentModel
            .findById(assessmentAnswerInput.assessmentId)
            .then(assessment => {
                assessment.status = assessmentAnswerInput.finishedAssessment
                    ? AssessmentStatus.COMPLETED
                    : AssessmentStatus.PARTIALLY_COMPLETED;

                assessment.answers.push(answer);

                assessment.save();

                return assessment;
            });
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
