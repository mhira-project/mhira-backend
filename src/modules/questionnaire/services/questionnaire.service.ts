import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    CreateQuestionnaireInput,
    UpdateQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { Questionnaire } from '../models/questionnaire.schema';

import xlsx from 'node-xlsx';
import { Question, QuestionType } from '../models/question.schema';
import { QuestionGroup } from '../models/question-group.schema';
import {
    QuestionnaireStatus,
    QuestionnaireVersion,
} from '../models/questionnaire-version.schema';
import { FileData, XLSForm } from '../helpers/xlsform-reader.helper';
import { XlsFormQuestionFactory } from '../helpers/xlsform-questions.factory';
import { FileUpload } from 'graphql-upload';
import { applyQuery } from '@nestjs-query/core';
import { QuestionniareVersionQuery } from '../resolvers/questionnaire.resolver';

@Injectable()
export class QuestionnaireService {
    constructor(
        @InjectModel(Questionnaire.name)
        private questionnaireModel: Model<Questionnaire>,
        @InjectModel(QuestionnaireVersion.name)
        private questionnaireVersionModel: Model<QuestionnaireVersion>,
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
        const version = await this.createNewVersion(
            await this.questionnaireVersionModel.findById(_id),
        );

        Object.entries(xlsForm).forEach(
            ([key, value]) => (version[key] = value),
        );

        await this.questionnaireModel.updateOne(
            { _id: version.questionnaire },
            {
                language: xlsForm.language,
            },
        );

        return (await version.save())
            .populate({
                path: 'questionnaire',
                model: Questionnaire.name,
            })
            .execPopulate();
    }

    getById(_id: Types.ObjectId) {
        return this.questionnaireModel.findById(_id).exec();
    }

    async getNewestVersionById(questionnaireId: Types.ObjectId) {
        return this.questionnaireVersionModel
            .findOne({
                questionnaire: questionnaireId,
            })
            .sort({
                createdAt: -1,
            })
            .populate({ path: 'questionnaire', model: Questionnaire.name })
            .exec();
    }

    async list(query: QuestionniareVersionQuery) {
        let questionnaireVersions: QuestionnaireVersion[] = (
            await this.questionnaireVersionModel.aggregate().group({
                _id: '$questionnaire',
                id: {
                    $last: '$_id',
                },
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
            })
        ).map(version => {
            version.questionnaire = version._id;
            version._id = version.id;
            delete version.id;

            return version as QuestionnaireVersion;
        });
        // only return questionnaireVersions with existing questionnaire... <= cannot delete questionnaireVersions if you want to recreate the questions for statistic purposes
        questionnaireVersions = questionnaireVersions.filter(
            version => version.questionnaire !== null,
        );

        const populatedQuestionnaires = await this.questionnaireVersionModel.populate(
            questionnaireVersions,
            {
                path: 'questionnaire',
                model: Questionnaire.name,
            },
        );

        return applyQuery(populatedQuestionnaires, query);
    }

    async deleteQuestionnaire(_id: Types.ObjectId, softDelete = true) {
        if (softDelete) {
            // only create archive version as most recent version.
            const version = await this.createNewVersion(
                await this.getNewestVersionById(_id),
            );

            if (version.status === QuestionnaireStatus.ARCHIVED) {
                throw new Error('QUestionnaire is already archived.');
            }

            version.status = QuestionnaireStatus.ARCHIVED;

            return version.save();
        }

        await this.questionnaireVersionModel
            .updateMany(
                { questionnaire: _id },
                {
                    questionnaire: null,
                },
            )
            .exec();

        return this.questionnaireModel.findByIdAndDelete(_id).exec();
    }

    private async createNewVersion(version: QuestionnaireVersion) {
        const newestVersionByQuestionnaire = await this.getNewestVersionById(
            (version.questionnaire as Questionnaire)._id ??
                (version.questionnaire as Types.ObjectId),
        );

        if (!version || !newestVersionByQuestionnaire._id.equals(version._id)) {
            throw new Error(
                'This version is invalid. Maybe this is not the newest version of questionnaire?',
            );
        }

        version._id = Types.ObjectId();

        version.isNew = true;

        version.createdAt = null;
        version.updatedAt = null;

        return version;
    }

    private findUniqueQuestionnaire(
        language: string,
        abbreviation: string,
    ): Promise<Questionnaire> {
        return this.questionnaireModel
            .findOne({
                language: language,
                abbreviation: abbreviation,
            })
            .exec();
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

        const createdQuestionnaireVersion = new this.questionnaireVersionModel();
        const createdQuestionnaire = new this.questionnaireModel();
        createdQuestionnaire.abbreviation = settings.form_id;
        createdQuestionnaire.language = questionnaireInput.language;

        createdQuestionnaireVersion.name =
            questionnaireInput.name ?? settings.form_title;

        createdQuestionnaireVersion.license = questionnaireInput.license;

        createdQuestionnaireVersion.copyright = questionnaireInput.copyright;
        createdQuestionnaireVersion.timeToComplete =
            questionnaireInput.timeToComplete;
        createdQuestionnaireVersion.website = questionnaireInput.website;
        createdQuestionnaireVersion.status =
            questionnaireInput.status ?? QuestionnaireStatus.DRAFT;

        createdQuestionnaireVersion.keywords = questionnaireInput.keywords;

        createdQuestionnaireVersion.language = questionnaireInput.language;
        createdQuestionnaireVersion.abbreviation = settings.form_id;

        let currentGroup: QuestionGroup = null;

        for (const questionData of xlsFormParsed.getQuestionData()) {
            if (questionData.type === QuestionType.END_GROUP) {
                createdQuestionnaireVersion.questionGroups.push(currentGroup);
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

        await createdQuestionnaire.save();

        createdQuestionnaireVersion.questionnaire = createdQuestionnaire._id;

        // first save the reference to the questionnaire, so no subdocument is created
        await createdQuestionnaireVersion.save();

        // reassign the questionnaire, so questionnaire fields can be accessed, without populating first. We already have the questionnaire ready.
        createdQuestionnaireVersion.questionnaire = createdQuestionnaire;
        return createdQuestionnaireVersion;
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
