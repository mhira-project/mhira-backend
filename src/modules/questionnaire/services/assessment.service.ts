import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    AnswerAssessmentInput,
    CreateQuestionnaireAssessmentInput,
} from '../dtos/assessment.input';
import { Answer } from '../models/answer.schema';
import {
    QuestionnaireAssessment,
    AssessmentStatus,
} from '../models/questionnaire-assessment.schema';
import { Question, questionType } from '../models/question.schema';
import {
    QuestionnaireStatus,
    QuestionnaireVersion,
} from '../models/questionnaire-version.schema';

export class AssessmentService {
    constructor(
        @InjectModel(QuestionnaireAssessment.name)
        private assessmentModel: Model<QuestionnaireAssessment>,
        @InjectModel(Question.name)
        private questionModel: Model<Question>,
        @InjectModel(Answer.name)
        private answerModel: Model<Answer>,
        @InjectModel(QuestionnaireVersion.name)
        private questionnaireVersionModel: Model<QuestionnaireVersion>,
    ) {}

    createNewAssessment(assessmentInput: CreateQuestionnaireAssessmentInput) {
        return this.assessmentModel.create(assessmentInput);
    }

    async addAnswerToAssessment(assessmentAnswerInput: AnswerAssessmentInput) {
        return this.assessmentModel
            .findById(assessmentAnswerInput.assessmentId)
            .then(assessment => {
                if (
                    assessment.status === AssessmentStatus.ARCHIVED ||
                    assessment.status === AssessmentStatus.COMPLETED
                ) {
                    throw new Error(
                        'You cannot add any more answers to this assessment.',
                    );
                }

                // TODO: check questionnaires and if they are versionned / archived, etc.
                this.questionnaireVersionModel
                    .findOne({
                        questionGroups: {
                            $elemMatch: {
                                'questionGroup.questions._id':
                                    assessmentAnswerInput.question,
                            },
                        },
                    })
                    .then(questionnaireVersion => {
                        if (
                            questionnaireVersion.status ===
                            QuestionnaireStatus.ARCHIVED
                        ) {
                            throw new Error(
                                'This questionnaire is archived. You cannot answer these questions anymore.',
                            );
                        }
                    });

                assessment.status = assessmentAnswerInput.finishedAssessment
                    ? AssessmentStatus.COMPLETED
                    : AssessmentStatus.PARTIALLY_COMPLETED;

                const answer = new this.answerModel();

                answer.question = assessmentAnswerInput.question;
                answer.multipleChoiceValue =
                    assessmentAnswerInput.multipleChoiceValue;
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
                                answer.multipleChoiceValue.length <
                                    question.min ||
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

                assessment.answers.push(answer);

                return assessment.save();
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
