import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    CreateQuestionnaireInput,
    ListQuestionnaireInput,
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

        return await this.createQuestionnaireFromFileData(fileData, xlsForm);
    }

    public async updateOne(
        _id: Types.ObjectId,
        xlsForm: UpdateQuestionnaireInput,
    ) {
        const version = await this.questionnaireVersionModel.findById(_id);

        const newestVersionByQuestionnaire = !!version
            ? await this.getNewestVersionById(
                  version.questionnaire as Types.ObjectId,
              )
            : null;

        if (!version || newestVersionByQuestionnaire._id != _id) {
            throw new Error(
                'This version is invalid. Maybe this is not the newest version of questionnaire?',
            );
        }

        version._id = Types.ObjectId();
        version.isNew = true;

        version.createdAt = null;
        version.updatedAt = null;

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

    getNewestVersionById(questionnaireId: Types.ObjectId) {
        return this.questionnaireVersionModel
            .findOne({ questionnaire: questionnaireId })
            .sort({ createdAt: -1 })
            .populate({ path: 'questionnaire', model: Questionnaire.name })
            .exec();
    }

    async list(filters: ListQuestionnaireInput) {
        // filter questionnaires by version. order by newest and only filter after results have been found.
        // TODO: add sorting and paging
        // TODO: add keywords
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
                copyright: {
                    $last: '$copyright',
                },
                license: {
                    $last: '$license',
                },
                timeToComplete: {
                    $last: '$timeToComplete',
                },
            })
        ).map(version => {
            version.questionnaire = version._id;
            version._id = version.id;
            delete version.id;

            return version as QuestionnaireVersion;
        });

        const populatedQuestionnaires = await this.questionnaireVersionModel.populate(
            questionnaireVersions,
            {
                path: 'questionnaire',
                model: Questionnaire.name,
            },
        );

        return populatedQuestionnaires.filter(version => {
            const questionnaire = version.questionnaire as Questionnaire;
            return (
                (!filters.language ||
                    questionnaire.language === filters.language) &&
                (!filters.abbreviation ||
                    questionnaire.abbreviation.includes(
                        filters.abbreviation,
                    )) &&
                (!filters.timeToComplete ||
                    version.timeToComplete === filters.timeToComplete) &&
                (!filters.license ||
                    version.license.includes(filters.license)) &&
                (!filters.status || version.status === filters.status)
            );
        });
    }

    delete(_id: Types.ObjectId) {
        // TODO: implement a soft delete with an ARCHIVE status => new Version with Archive
        // TODO: delete all versions by questionnaire
        return this.questionnaireModel.findByIdAndDelete(_id).exec();
    }

    private createQuestionnaireFromFileData(
        fileData: FileData[],
        questionnaireInput: CreateQuestionnaireInput,
    ) {
        const createdQuestionnaire = new this.questionnaireModel();
        const xlsFormParsed: XLSForm = new XLSForm(fileData);
        const settings = xlsFormParsed.getSettings();

        const createdQuestionnaireVersion = new this.questionnaireVersionModel();

        createdQuestionnaire.abbreviation = settings.form_id;
        createdQuestionnaire.language = questionnaireInput.language;
        createdQuestionnaireVersion.name =
            questionnaireInput.name ?? settings.form_title;

        createdQuestionnaireVersion.license = questionnaireInput.license;

        if (!questionnaireInput.copyright) {
            throw new Error('Copyright is required.');
        }

        createdQuestionnaireVersion.copyright = questionnaireInput.copyright;
        createdQuestionnaireVersion.timeToComplete =
            questionnaireInput.timeToComplete;
        createdQuestionnaireVersion.website = questionnaireInput.website;
        createdQuestionnaireVersion.status =
            questionnaireInput.status ?? QuestionnaireStatus.DRAFT;

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

        createdQuestionnaire.save();

        createdQuestionnaireVersion.questionnaire = createdQuestionnaire._id;

        return createdQuestionnaireVersion.save();
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
