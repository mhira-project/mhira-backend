import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
    CreateQuestionnaireScriptInput,
    UpdateQuestionnaireScriptInput,
} from '../dtos/questionnaire-script.input';
// import { QuestionnaireScriptReport } from '../models/questionnaire-script-report.model';
import { QuestionnaireScript } from '../models/questionnaire-script.model';
import { Report } from 'src/modules/report/models/report.model';
import { ConnectionType } from '@nestjs-query/query-graphql';
import {
    InjectQueryService,
    QueryService,
    mergeFilter,
} from '@nestjs-query/core';

import { QuestionnaireScriptConnection } from '../dtos/questionnaire-scripts.args';
import { Questionnaire } from '../models/questionnaire.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionnaireVersion } from '../models/questionnaire-version.schema';

@Injectable()
export class QuestionnaireScriptService {
    constructor(
        @InjectRepository(QuestionnaireScript)
        private questionnaireScriptRepository: Repository<QuestionnaireScript>,
        @InjectQueryService(QuestionnaireScript)
        private readonly questionnaireScriptQueryService: QueryService<
            QuestionnaireScript
        >,
        @InjectModel(QuestionnaireVersion.name)
        private questionnaireVersionModel: Model<QuestionnaireVersion>,
    ) {}
    async createNewScript(input: CreateQuestionnaireScriptInput) {
        const { scriptText, reportIds, questionnaireId, ...rest } = input;
        const scriptTexts = await this.readFileUpload(scriptText);

        const questionnaireVersion = await this.questionnaireVersionModel
            .findById(questionnaireId)
            .exec();

        if (!questionnaireVersion)
            throw new NotFoundException('Questionnaire not found!');

        const reports = await Report.find({
            where: { id: In(reportIds) },
        });

        const newQuestionnaireScript = await this.questionnaireScriptRepository.create(
            {
                ...rest,
                scriptText: scriptTexts,
            },
        );

        newQuestionnaireScript.reports = reports;
        newQuestionnaireScript.questionnaireId = questionnaireId;

        await newQuestionnaireScript.save();

        return newQuestionnaireScript;
    }

    async getQuestionnaireScripts(
        query,
        currentUser,
    ): Promise<ConnectionType<QuestionnaireScript>> {
        const combinedFilter = mergeFilter(query.filter, {
            questionnaireId: {
                eq: query.questionnaireId,
            },
        });

        // Apply combined authorized filter
        query.filter = combinedFilter;

        const result = await QuestionnaireScriptConnection.createFromPromise(
            q => this.questionnaireScriptQueryService.query(q),
            query,
            q => this.questionnaireScriptQueryService.count(q),
        );

        return result;
    }

    async updateQuestionnaireScripts(
        input: UpdateQuestionnaireScriptInput,
    ): Promise<QuestionnaireScript> {
        const { id, ...rest } = input;

        const questionnaireScript = await this.questionnaireScriptRepository.findOne(
            {
                relations: ['reports'],
                where: { id: 8 },
            },
        );
        //   const test = this.questionnaireScriptRepository.update({id}, {...rest}).then(response => response.raw[0]);

        const reports = await Report.find({ id: 7 });

        console.log(reports);

        questionnaireScript.reports = reports;

        await questionnaireScript.save();

        return questionnaireScript;
    }

    private async readFileUpload(fileData): Promise<any> {
        const file = await fileData;
        return new Promise(resolve => {
            const stream = file.createReadStream();
            const chunks = [];
            stream.on('data', (chunk: Buffer) => chunks.push(chunk));
            stream.on('end', () =>
                resolve(Buffer.concat(chunks).toString('utf-8')),
            );
        });
    }
}
