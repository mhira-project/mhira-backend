import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    AnswerAssessmentInput,
} from '../dtos/assessment.input';
import { Answer } from '../models/answer.schema';
import {
    QuestionnaireAssessment,
    AssessmentStatus,
} from '../models/questionnaire-assessment.schema';
import {
    QuestionnaireStatus,
    QuestionnaireVersion,
} from '../models/questionnaire-version.schema';
import { QuestionValidatorFactory } from '../helpers/question-validator.factory';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment, FullAssessment } from '../../assessment/models/assessment.model';
import { Repository } from 'typeorm';

export class AssessmentService {
    constructor(
        @InjectModel(QuestionnaireAssessment.name)
        private assessmentModel: Model<QuestionnaireAssessment>,
        @InjectModel(Answer.name)
        private answerModel: Model<Answer>,
        @InjectModel(QuestionnaireVersion.name)
        private questionnaireVersionModel: Model<QuestionnaireVersion>,
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>
    ) { }

    async createNewAssessment(
        questionnaires: Types.ObjectId[],
    ) {
        await Promise.all(
            questionnaires.map(async versionId => {
                const questionnaireVersion = await this.questionnaireVersionModel.findById(
                    versionId,
                );

                if (
                    ![
                        QuestionnaireStatus.PRIVATE,
                        QuestionnaireStatus.PUBLISHED,
                    ].includes(questionnaireVersion.status)
                ) {
                    throw new Error(
                        `${questionnaireVersion.name} has status ${questionnaireVersion.status} and cannot be added to assessment.`,
                    );
                }
            }),
        );

        return this.assessmentModel.create({ questionnaires });
    }

    async addAnswerToAssessment(assessmentAnswerInput: AnswerAssessmentInput) {
        const foundAssessment: QuestionnaireAssessment = await this.assessmentModel.findById(
            assessmentAnswerInput.assessmentId,
        );

        // TODO: check if this version is newest version. if not throw error

        if (!foundAssessment) {
            throw new Error('No assessment found.');
        }

        if (
            ![
                AssessmentStatus.PARTIALLY_COMPLETED,
                AssessmentStatus.PENDING,
            ].includes(foundAssessment.status)
        ) {
            throw new Error(
                'You cannot add any more answers to this assessment.',
            );
        }

        const questionnaireVersion: QuestionnaireVersion = await this.questionnaireVersionModel.findById(
            assessmentAnswerInput.questionnaireVersionId,
        );

        if (
            !questionnaireVersion ||
            !(foundAssessment.questionnaires as Types.ObjectId[]).includes(
                questionnaireVersion._id,
            ) ||
            ![
                QuestionnaireStatus.PUBLISHED,
                QuestionnaireStatus.PRIVATE,
            ].includes(questionnaireVersion.status)
        ) {
            throw new Error('Invalid questionnaire linked to this question.');
        }
        const question = questionnaireVersion.questionGroups
            .filter(
                questionGroups =>
                    questionGroups.questions.filter(
                        question =>
                            question._id == assessmentAnswerInput.question,
                    ).length > 0,
            )[0]
            ?.questions.filter(
                question => question._id == assessmentAnswerInput.question,
            )[0];

        if (!question) {
            throw new Error('Invalid question answered');
        }

        const answerExisting = foundAssessment.answers.filter(
            answer => answer.question === assessmentAnswerInput.question,
        );

        const answer = answerExisting[0] ?? new this.answerModel();

        answer.question = assessmentAnswerInput.question;
        answer.multipleChoiceValue = assessmentAnswerInput.multipleChoiceValue;
        answer.booleanValue = assessmentAnswerInput.booleanValue;
        answer.textValue = assessmentAnswerInput.textValue;
        answer.numberValue = assessmentAnswerInput.numberValue;
        answer.dateValue = assessmentAnswerInput.dateValue;

        const validator = QuestionValidatorFactory.getValidatorForQuestion(
            question,
        );

        if (validator.isValid(answer)) {
            if (!answerExisting[0]) {
                foundAssessment.answers.push(answer);
            } else {
                foundAssessment.answers[
                    foundAssessment.answers.indexOf(answerExisting[0])
                ] = answer;
            }

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

        return null;
    }

    deleteAssessment(_id: Types.ObjectId, archive = true) {
        return (archive
            ? this.assessmentModel.findByIdAndUpdate(_id, {
                status: AssessmentStatus.ARCHIVED,
            })
            : this.assessmentModel.findByIdAndDelete(_id)
        ).exec();
    }

    getById(_id: Types.ObjectId) {
        return this.assessmentModel.findById(_id).exec();
    }

    async getFullAssessment(assessmentId: number): Promise<FullAssessment> {
        const assessment: FullAssessment = await this.assessmentRepository.findOne(assessmentId, { relations: ['clinician', 'patient'] }) as FullAssessment;
        assessment.questionnaireAssessment = await this.assessmentModel
            .findById(assessment.questionnaireAssessmentId)
            .populate({
                path: 'questionnaires',
                model: QuestionnaireVersion.name,
            })
            .exec();
        return assessment;
    }
}
