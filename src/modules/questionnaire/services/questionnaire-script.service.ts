import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
    CreateQuestionnaireScriptInput,
    UpdateQuestionnaireScriptInput,
} from '../dtos/questionnaire-script.input';
import { QuestionnaireScript } from '../models/questionnaire-script.model';
import { Report } from 'src/modules/report/models/report.model';
import { ConnectionType } from '@nestjs-query/query-graphql';
import {
    InjectQueryService,
    QueryService,
    mergeFilter,
} from '@nestjs-query/core';

import { QuestionnaireScriptConnection } from '../dtos/questionnaire-scripts.args';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Questionnaire } from '../models/questionnaire.schema';

@Injectable()
export class QuestionnaireScriptService {
    constructor(
        @InjectRepository(QuestionnaireScript)
        private questionnaireScriptRepository: Repository<QuestionnaireScript>,
        @InjectQueryService(QuestionnaireScript)
        private readonly questionnaireScriptQueryService: QueryService<
            QuestionnaireScript
        >,
        @InjectModel(Questionnaire.name)
        private questionnaireModel: Model<Questionnaire>,
    ) {}
    async createNewScript(input: CreateQuestionnaireScriptInput) {
        const { scriptText, reportIds, questionnaireId, ...rest } = input;
        const scriptTexts = await this.readFileUpload(scriptText);

        const questionnaireVersion = await this.questionnaireModel
            .findById(questionnaireId)
            .exec();

        if (!questionnaireVersion) {
            throw new NotFoundException('Questionnaire not found!');
        }

        const cleanedReportIds = [...new Set(reportIds)];

        const reports = await Report.find({
            where: { id: In(cleanedReportIds) },
        });

        if (reports.length !== cleanedReportIds.length) {
            throw new NotFoundException(
                'Report for questionnaire script not found!',
            );
        }

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

    async getQuestionnaireScriptsById(
        questionnaireId,
    ): Promise<QuestionnaireScript[]> {
        const questionnaireScripts = await this.questionnaireScriptRepository.find(
            { questionnaireId },
        );

        return questionnaireScripts;
    }

    async updateQuestionnaireScripts(
        input: UpdateQuestionnaireScriptInput,
    ): Promise<QuestionnaireScript> {
        const { id, update } = input;
        const { reportIds, scriptText, ...rest } = update;

        const questionnaireScript = await this.questionnaireScriptRepository.findOne(
            {
                relations: ['reports'],
                where: { id },
            },
        );

        if (!questionnaireScript)
            throw new NotFoundException('Questionnaire script not found!');

        const cleanedReportIds = [...new Set(reportIds)];

        const reports = await Report.find({ id: In(cleanedReportIds) });

        if (reports.length !== cleanedReportIds.length)
            throw new NotFoundException(
                'Report for questionnaire script not found!',
            );

        questionnaireScript.reports = reports;

        if (scriptText) {
            const scriptTexts = await this.readFileUpload(scriptText);
            questionnaireScript.scriptText = scriptTexts;
        }

        return await this.questionnaireScriptRepository.save({
            id,
            ...questionnaireScript,
            ...rest,
        });
    }

    delete(input: any) {
        return this.questionnaireScriptRepository.softDelete({ id: input.id });
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
