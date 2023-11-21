import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { AnswerAssessmentInput } from '../dtos/assessment.input';
import { Answer } from '../models/answer.schema';
import { QuestionnaireAssessment } from '../models/questionnaire-assessment.schema';
import {
    QuestionnaireStatus,
    Questionnaire,
} from '../models/questionnaire.schema';
import { QuestionValidatorFactory } from '../helpers/question-validator.factory';
import { AssessmentStatus } from '../enums/assessment-status.enum';
import { UserInputError } from 'apollo-server-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { Repository } from 'typeorm';
import { QuestionnaireBundle } from '../models/questionnaire-bundle.schema';

export class QuestionnaireAssessmentService {
    constructor(
        @InjectModel(QuestionnaireAssessment.name)
        private assessmentModel: Model<QuestionnaireAssessment>,
        @InjectModel(Answer.name)
        private answerModel: Model<Answer>,
        @InjectModel(Questionnaire.name)
        private questionnaireModel: Model<Questionnaire>,
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
    ) {}

    async createNewAssessment(
        questionnaires: Types.ObjectId[],
        questionnaireBundles?: Types.ObjectId[],
    ) {
        await Promise.all(
            questionnaires.map(async versionId => {
                const questionnaireVersion = await this.questionnaireModel.findById(
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

                return questionnaireVersion;
            }),
        );

        return this.assessmentModel.create({
            questionnaires,
            questionnaireBundles,
        });
    }

    /**
     * Adds an answer subdocument to existing mongodb questionnaire assessment
     * @param assessmentAnswerInput
     * @returns
     */
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
                AssessmentStatus.OPEN_FOR_COMPLETION,
            ].includes(foundAssessment.status)
        ) {
            throw new Error(
                'You cannot add any more answers to this assessment.',
            );
        }

        const questionnaire: Questionnaire = await this.questionnaireModel.findById(
            assessmentAnswerInput.questionnaireVersionId,
        );

        if (
            !questionnaire ||
            !(foundAssessment.questionnaires as Types.ObjectId[]).includes(
                questionnaire._id,
            ) ||
            ![
                QuestionnaireStatus.PUBLISHED,
                QuestionnaireStatus.PRIVATE,
            ].includes(questionnaire.status)
        ) {
            throw new Error('Invalid questionnaire linked to this question.');
        }
        const question = questionnaire.questionGroups
            .filter(
                questionGroups =>
                    questionGroups.questions.filter(
                        item => item._id == assessmentAnswerInput.question,
                    ).length > 0,
            )[0]
            ?.questions.filter(
                item => item._id == assessmentAnswerInput.question,
            )[0];

        if (!question) {
            throw new Error('Invalid question answered');
        }

        const answerExisting = foundAssessment.answers.find(
            item => item.question === assessmentAnswerInput.question,
        );

        const answer = answerExisting ?? new this.answerModel();

        answer.question = assessmentAnswerInput.question;
        answer.multipleChoiceValue = assessmentAnswerInput.multipleChoiceValue;
        answer.booleanValue = assessmentAnswerInput.booleanValue;
        answer.textValue = assessmentAnswerInput.textValue;
        answer.numberValue = assessmentAnswerInput.numberValue;
        answer.dateValue = assessmentAnswerInput.dateValue;

        const validator = QuestionValidatorFactory.getValidatorForQuestion(
            question,
        );

        try {
            answer.valid = validator.isValid(answer);

            if (!answerExisting) {
                foundAssessment.answers.push(answer);
            } else {
                foundAssessment.answers[
                    foundAssessment.answers.indexOf(answerExisting)
                ] = answer;
            }

            // return updated model
            return foundAssessment.save();
        } catch (e) {
            if (e instanceof UserInputError) {
                answer.valid = false;
                if (answerExisting) {
                    // invalidate existing answer
                    foundAssessment.answers[
                        foundAssessment.answers.indexOf(answerExisting)
                    ] = answer;
                    await foundAssessment.save();
                }
            }
            throw e;
        }
    }

    async changeAssessmentStatus(
        assessmentId: Types.ObjectId,
        status: AssessmentStatus,
    ) {
        const assessmentModel = await this.assessmentModel.findById(
            assessmentId,
        );
        const assessment = await this.assessmentRepository.findOne({
            where: { questionnaireAssessmentId: assessmentId },
        });

        if (
            assessmentModel.status !== AssessmentStatus.COMPLETED &&
            status === AssessmentStatus.COMPLETED
        ) {
            assessment.submissionDate = new Date();
        }

        if (assessment) {
            assessment.status = status;
            await assessment.save();
        }

        assessmentModel.status = status;
        return assessmentModel.save();
    }

    async deleteAssessment(_id: Types.ObjectId, archive = true) {
        const assessment = await this.assessmentModel.findById(_id);

        return (archive
            ? this.assessmentModel.findByIdAndUpdate(_id, {
                  status:
                      assessment?.status !== AssessmentStatus.COMPLETED
                          ? AssessmentStatus.CANCELLED
                          : assessment?.status,
              })
            : this.assessmentModel.findByIdAndDelete(_id)
        )
            .orFail()
            .exec();
    }

    getById(_id: Types.ObjectId | string, populate = true) {
        if (typeof _id === 'string') {
            _id = Types.ObjectId(_id);
        }

        const query = this.assessmentModel.findById(_id)

        if (populate) {
            query.populate({
                path: 'questionnaires',
                model: Questionnaire.name,
            });
            query.populate({
                path: 'questionnaireBundles',
                model: QuestionnaireBundle.name,
            });
        }
        
        return query.orFail().exec();
    }

    async updateAssessment(
        assessmentId: Types.ObjectId | QuestionnaireAssessment,
        questionnaires: Types.ObjectId[],
    ) {
        let questionnaireAssessment: QuestionnaireAssessment;

        if (isValidObjectId(assessmentId)) {
            questionnaireAssessment = await this.assessmentModel
                .findById(assessmentId)
                .orFail()
                .exec();
        } else {
            questionnaireAssessment = assessmentId as QuestionnaireAssessment;
        }

        questionnaireAssessment.questionnaires = questionnaires;
        return questionnaireAssessment.save();
    }
}
