import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    CreateQuestionnaireInput,
    UpdateQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { Questionnaire, QuestionnaireStatus } from '../models/questionnaire.schema';

import xlsx from 'node-xlsx';
import { Question, QuestionType } from '../models/question.schema';
import { QuestionGroup } from '../models/question-group.schema';
import { XLSForm } from '../helpers/xlsform-reader.helper';
import { XlsFormQuestionFactory } from '../helpers/xlsform-questions.factory';
import { FileUpload } from 'graphql-upload';
import { applyQuery } from '@nestjs-query/core';
import { QuestionniareQuery } from '../resolvers/questionnaire.resolver';
import { FileData } from '../dtos/xlsform.dto';

@Injectable()
export class QuestionnaireService {
    constructor(
        @InjectModel(Questionnaire.name)
        private questionnaireModel: Model<Questionnaire>,
        @InjectModel(QuestionGroup.name)
        private questionGroupModel: Model<QuestionGroup>,
        @InjectModel(Question.name)
        private questionModel: Model<Question>,
    ) {}

    public async create(xlsForm: CreateQuestionnaireInput) {
        const fileData: FileData[] = await this.readFileUpload(
            await xlsForm.excelFile,
        );

        return this.createQuestionnaireFromFileData(fileData, xlsForm);
    }

    public async updateOne(
        _id: Types.ObjectId,
        xlsForm: UpdateQuestionnaireInput,
    ) {
        const version = await this.questionnaireModel.findById(_id)

        Object.entries(xlsForm).forEach(
            ([key, value]) => (version[key] = value),
        );

        return (await version.save())
            .populate({
                path: 'questionnaire',
                model: Questionnaire.name,
            })
            .execPopulate();
    }

    public async getById(questionnaireId: Types.ObjectId) {
        return this.questionnaireModel.findOne({ _id: questionnaireId })
    }

    async list(query: QuestionniareQuery) {
        const questionnaires: Questionnaire[] = (
            await this.questionnaireModel.aggregate().group({
                _id: '$_id',
                createdAt: {
                    $last: '$createdAt',
                },
                status: {
                    $last: '$status',
                },
                name: {
                    $last: '$name',
                },
                website: {
                    $last: '$website',
                },
                keywords: {
                    $last: '$keywords',
                },
                copyright: {
                    $last: '$copyright',
                },
                license: {
                    $last: '$license',
                },
                timeToComplete: {
                    $last: '$timeToComplete',
                },
                questionGroups: {
                    $last: '$questionGroups',
                },
                description: {
                    $last: '$description'
                },
                language: {
                    $last: '$language'
                },
                abbreviation: {
                    $last: '$abbreviation'
                },
                zombie: {
                    $last: '$zombie'
                }
            })
        );

        return applyQuery(questionnaires, query);
    }

    async deleteQuestionnaire(_id: Types.ObjectId) {
        const version = await this.getById(_id)

        if (version.zombie) {
            throw new Error('Questionnaire is already discarded.');
        }

        version.zombie = true;

        return version.save();
    }

    private findUniqueQuestionnaire(
        language: string,
        abbreviation: string,
    ): Promise<Questionnaire> {
        return this.questionnaireModel
            .findOne({
                language: language,
                abbreviation: abbreviation,
                zombie: { $ne: true }
            })
            .exec()
    }

    private async createQuestionnaireFromFileData(
        fileData: FileData[],
        questionnaireInput: CreateQuestionnaireInput,
    ) {
        const xlsFormParsed: XLSForm = new XLSForm(fileData);
        const settings = xlsFormParsed.getSettings();

        if (
            await this.findUniqueQuestionnaire(
                questionnaireInput.language,
                settings.form_id,
            )
        ) {
            throw new Error(
                `A questionnaire for '${settings.form_id}' already exists in language '${questionnaireInput.language}'.`,
            );
        }

        const createdQuestionnaire = new this.questionnaireModel();

        createdQuestionnaire.name =
            questionnaireInput.name ?? settings.form_title;

        createdQuestionnaire.license = questionnaireInput.license;

        createdQuestionnaire.copyright = questionnaireInput.copyright;
        createdQuestionnaire.timeToComplete =
            questionnaireInput.timeToComplete;
        createdQuestionnaire.website = questionnaireInput.website;
        createdQuestionnaire.status =
            questionnaireInput.status ?? QuestionnaireStatus.DRAFT;

        createdQuestionnaire.keywords = questionnaireInput.keywords;

        createdQuestionnaire.language = questionnaireInput.language;
        createdQuestionnaire.abbreviation = settings.form_id;
        createdQuestionnaire.description = questionnaireInput.description;
        createdQuestionnaire.zombie = false;

        let currentGroup: QuestionGroup = null;

        for (const questionData of xlsFormParsed.getQuestionData()) {
            if (questionData.type === QuestionType.END_GROUP) {
                currentGroup && createdQuestionnaire.questionGroups.push(currentGroup);
                currentGroup = null;
            } else {
                const question = XlsFormQuestionFactory.createQuestion(
                    questionData,
                    xlsFormParsed,
                    new this.questionModel(),
                    new this.questionGroupModel(),
                );

                if ('questions' in question) {
                    currentGroup = question;
                } else {
                    currentGroup.questions.push(question);
                }
            }
        }

        return createdQuestionnaire.save();
    }

    private readFileUpload(xlsForm: FileUpload): Promise<FileData[]> {
        return new Promise(resolve => {
            const stream = xlsForm.createReadStream();
            const chunks = [];

            stream.on('data', (chunk: Buffer) => chunks.push(chunk));
            stream.on('end', () => {
                const fileData = xlsx.parse(Buffer.concat(chunks), {
                    type: 'buffer',
                }) as FileData[];
                resolve(fileData);
            });
        });
    }
}
