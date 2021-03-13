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
import { resolve } from 'path';

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
        // TODO: check questionnaire versions if they are drafts or archived

        assessmentInput.questionnaires.forEach(versionId =>
            this.questionnaireVersionModel
                .findById(versionId)
                .then(questionnaireVersion => {
                    if (
                        questionnaireVersion.status ===
                            QuestionnaireStatus.ARCHIVED ||
                        questionnaireVersion.status ===
                            QuestionnaireStatus.DRAFT
                    ) {
                        throw new Error(
                            `${questionnaireVersion.name} has status ${questionnaireVersion.status} and cannot be added to assessment.`,
                        );
                    }
                }),
        );

        return this.assessmentModel.create(assessmentInput);
    }

    async addAnswerToAssessment(assessmentAnswerInput: AnswerAssessmentInput) {
        let foundAssessment: QuestionnaireAssessment;

        await this.assessmentModel
            .findById(assessmentAnswerInput.assessmentId)
            .then(assessment => {
                if (!assessment) {
                    throw new Error('No assessment found.');
                }

                if (
                    [
                        AssessmentStatus.ARCHIVED,
                        AssessmentStatus.COMPLETED,
                        AssessmentStatus.EXPIRED,
                    ].includes(assessment.status)
                ) {
                    throw new Error(
                        'You cannot add any more answers to this assessment.',
                    );
                }

                foundAssessment = assessment;
            });

        await this.questionnaireVersionModel
            .findOne({
                questionGroups: {
                    $elemMatch: {
                        questions: {
                            $elemMatch: {
                                _id: assessmentAnswerInput.question,
                            },
                        },
                    },
                },
            })
            .then(questionnaireVersion => {
                if (
                    !questionnaireVersion ||
                    !(foundAssessment.questionnaires as Types.ObjectId[]).includes(
                        questionnaireVersion._id,
                    ) ||
                    questionnaireVersion.status === QuestionnaireStatus.ARCHIVED
                ) {
                    throw new Error(
                        'Invalid questionnaire linked to this question.',
                    );
                }
                const question = questionnaireVersion.questionGroups
                    .filter(
                        questionGroups =>
                            questionGroups.questions.filter(
                                question =>
                                    question._id ==
                                    assessmentAnswerInput.question,
                            ).length > 0,
                    )[0]
                    ?.questions.filter(
                        question =>
                            question._id == assessmentAnswerInput.question,
                    )[0];

                const answerExisting = foundAssessment.answers.filter(
                    answer =>
                        answer.question === assessmentAnswerInput.question,
                );

                const answer = answerExisting[0] ?? new this.answerModel();

                answer.question = assessmentAnswerInput.question;
                answer.multipleChoiceValue =
                    assessmentAnswerInput.multipleChoiceValue;
                answer.booleanValue = assessmentAnswerInput.booleanValue;
                answer.textValue = assessmentAnswerInput.textValue;
                answer.numberValue = assessmentAnswerInput.numberValue;
                answer.dateValue = assessmentAnswerInput.dateValue;

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
                    const choices = question.choices.map(choice => choice.name);

                    if (
                        answer.multipleChoiceValue &&
                        (answer.multipleChoiceValue?.length < question.min ||
                            answer.multipleChoiceValue?.length > question.max)
                    ) {
                        throw new Error(
                            `Number of answers must be between ${question.min} and ${question.max}`,
                        );
                    }

                    if (
                        answer.multipleChoiceValue?.some(
                            c => !choices.includes(c),
                        ) ||
                        !choices.includes(answer.textValue)
                    ) {
                        throw new Error(
                            `Please only choose available answers!`,
                        );
                    }
                }

                if (!answerExisting[0]) {
                    foundAssessment.answers.push(answer);
                } else {
                    foundAssessment.answers[
                        foundAssessment.answers.indexOf(answerExisting[0])
                    ] = answer;
                }
            });

        foundAssessment.status = assessmentAnswerInput.finishedAssessment
            ? AssessmentStatus.COMPLETED
            : AssessmentStatus.PARTIALLY_COMPLETED;

        return this.assessmentModel
            .findByIdAndUpdate(
                assessmentAnswerInput.assessmentId,
                foundAssessment,
            )
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

    getById(_id: Types.ObjectId) {
        return this.assessmentModel.findById(_id).exec();
    }
}
