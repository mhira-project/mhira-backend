import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { applyQuery } from '@nestjs-query/core';

import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
import { QuestionniareVersionQuery } from '../resolvers/questionnaire.resolver';
import { Questionnaire } from '../models/questionnaire.schema';

export class QuestionnaireVersionService {
    constructor(
        @InjectModel(QuestionnaireVersion.name)
        private questionnaireVersionModel: Model<QuestionnaireVersion>,
    ) {}

    async getAllVersions(query: QuestionniareVersionQuery) {
        let questionnaireVersions: QuestionnaireVersion[] = (
            await this.questionnaireVersionModel.find()
        ).map(version => {
            version.questionnaire = version._id;
            version._id = version.id;
            delete version.id;

            return version as QuestionnaireVersion;
        });
        // only return questionnaireVersions with existing questionnaire... <= cannot delete questionnaireVersions if you want to recreate the questions for statistic purposes

        // questionnaireVersions = questionnaireVersions.filter(
        //     version => version.questionnaire !== null,
        // );

        const populatedQuestionnaires = await this.questionnaireVersionModel.populate(
            questionnaireVersions,
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
