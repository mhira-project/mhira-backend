import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    CreateQuestionnaireBundleInput,
    UpdateQuestionnaireBundleInput,
} from '../dtos/questionnaire-bundle.input';
import { QuestionnaireBundle } from '../models/questionnaire-bundle.schema';
import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
import { Questionnaire } from '../models/questionnaire.schema';
import { QuestionniareBundleQuery } from '../resolvers/questionnaire-bundle.resolver';
import { applyQuery } from '@nestjs-query/core';
import { NotFoundException } from '@nestjs/common';

export class QuestionnaireBundleService {
    constructor(
        @InjectModel(QuestionnaireBundle.name)
        private questionnaireBundleModel: Model<QuestionnaireBundle>,
        @InjectModel(QuestionnaireVersion.name)
        private questionnaireVersionModel: Model<QuestionnaireVersion>,
    ) {}

    getById(_id: Types.ObjectId) {
        return this.questionnaireBundleModel
            .findById(_id)
            .populate({
                path: 'questionnaires',
                model: QuestionnaireVersion.name,
            })
            .exec();
    }

    async createQuestionnaireBundle(input: CreateQuestionnaireBundleInput) {
        const newQuestionnaireBundle = new this.questionnaireBundleModel();
        newQuestionnaireBundle.name = input.name;
        newQuestionnaireBundle.questionnaires = input.questionnaireIds;
        return await newQuestionnaireBundle.save();
    }

    async list(query: QuestionniareBundleQuery) {
        const questionnaireBundles: QuestionnaireBundle[] = await this.questionnaireBundleModel
            .find()
            .populate({
                path: 'questionnaires',
                model: QuestionnaireVersion.name,
            });

        const populatedQuestionnaireBundles = await Promise.all(
            questionnaireBundles.map(async bundle => {
                await this.questionnaireVersionModel.populate(
                    bundle.questionnaires,
                    {
                        path: 'questionnaire',
                        model: Questionnaire.name,
                    },
                );

                return bundle;
            }),
        );

        return applyQuery(populatedQuestionnaireBundles, query);
    }

    deleteQuestionnaireBundle(id: string) {
        const _id = Types.ObjectId(id);
        return this.questionnaireBundleModel.findByIdAndDelete(_id).exec();
    }

    async updateQuestionnaireBundle(input: UpdateQuestionnaireBundleInput) {
        const { _id, ...restInput } = input;
        const id = Types.ObjectId(_id);
        const questionnaireBundle = await this.questionnaireBundleModel.findById(
            id,
        );

        if (!questionnaireBundle) {
            throw new NotFoundException();
        }

        questionnaireBundle.name = restInput.name;
        questionnaireBundle.questionnaires = restInput.questionnaireIds;

        return questionnaireBundle.save();
    }
}