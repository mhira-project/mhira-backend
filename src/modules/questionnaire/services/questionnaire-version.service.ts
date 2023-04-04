import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ObjectId } from 'mongoose';
import { applyQuery } from '@nestjs-query/core';

import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
import { QuestionniareVersionQuery } from '../resolvers/questionnaire.resolver';
import { Questionnaire } from '../models/questionnaire.schema';
import { QuestionnaireService } from './questionnaire.service';
import { Inject } from '@nestjs/common';
import { ObjectID } from 'typeorm';

export class QuestionnaireVersionService {
    @Inject(QuestionnaireService) questionnaireService: QuestionnaireService;

    constructor(
        @InjectModel(QuestionnaireVersion.name)
        private questionnaireVersionModel: Model<QuestionnaireVersion>,
    ) {}

    async getAllVersions(query: QuestionniareVersionQuery) {
        let questionnaireVersions: QuestionnaireVersion[] = await this.questionnaireVersionModel.find();
        const filteredQuestionnaireVersions: QuestionnaireVersion[] = [];

        for (let i = 0; i < questionnaireVersions.length; i++) {
            const version = questionnaireVersions[i] as QuestionnaireVersion;

            const lastVersion = await this.questionnaireService.getNewestVersionById(
                version.questionnaire as ObjectID,
            );

            if (version._id.toString() !== lastVersion._id.toString()) {
                version.questionnaire = version._id;
                version._id = version.id;
                delete version.id;

                filteredQuestionnaireVersions.push(version);
            }
        }

        const populatedQuestionnaires = await this.questionnaireVersionModel.populate(
            filteredQuestionnaireVersions,
            {
                path: 'questionnaire',
                model: Questionnaire.name,
            },
        );

        return applyQuery(populatedQuestionnaires, query);
    }

    getById(_id: Types.ObjectId) {
        return this.questionnaireVersionModel.findById(_id).exec();
    }
}
