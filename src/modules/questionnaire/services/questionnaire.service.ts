import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    CreateRawQuestionnaireInput,
    ListQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { Questionnaire } from '../models/questionnaire.schema';

import xlsx from 'node-xlsx';
import { Question, questionType } from '../models/question.schema';
import { QuestionGroup } from '../models/question-group.schema';
import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
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
        private questionGroupModel: Model<QuestionGroup>, // TODO: either remove or move to factory if injected model is needed
        @InjectModel(Question.name)
        private questionModel: Model<Question>,
    ) {}

    public async create(xlsForm: FileUpload) {
        const fileData: FileData[] = await this.readFileUpload(xlsForm);

        return await this.createQuestionnaireFromFileData(fileData);
    }

    getById(_id: Types.ObjectId) {
        return this.questionnaireModel.findById(_id).exec();
    }

    getNewestVersionById(questionnaireId: Types.ObjectId) {
        return this.questionnaireVersionModel
            .findOne({ questionnaire: questionnaireId })
            .sort({ created_at: -1 })
            .populate({ path: 'questionnaire', model: Questionnaire.name })
            .exec();
    }

    async list(filters: ListQuestionnaireInput) {
        // filter by questionnaire versions => order by newest of questionnaire (distinct) so no errors can happen

        return await this.questionnaireVersionModel
            .aggregate()
            .group({
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

                timeToComplete: {
                    $last: '$timeToComplete',
                },
                license: {
                    $last: '$license',
                },
            })
            .then(questionnaireVersions => {
                questionnaireVersions = questionnaireVersions.map(version => {
                    version.questionnaire = version._id;
                    version._id = version.id;
                    delete version.id;
                    return {
                        _id: version._id,
                        questionnaire: version.questionnaire,
                        license: version.license,
                        timeToComplete: version.timeToComplete,
                        status: version.status,
                        createdAt: version.createdAt,
                    } as QuestionnaireVersion;
                });

                return this.questionnaireVersionModel
                    .populate(questionnaireVersions, {
                        path: 'questionnaire',
                        model: Questionnaire.name,
                    })
                    .then(questionVersions => {
                        return questionVersions.filter(
                            version =>
                                (!filters.language ||
                                    (version.questionnaire as Questionnaire)
                                        .language === filters.language) &&
                                (!filters.abbreviation ||
                                    (version.questionnaire as Questionnaire).abbreviation.includes(
                                        filters.abbreviation,
                                    )) &&
                                (!filters.timeToComplete ||
                                    version.timeToComplete ===
                                        filters.timeToComplete) &&
                                (!filters.license ||
                                    version.license.includes(
                                        filters.license,
                                    )) &&
                                (!filters.status ||
                                    version.status === filters.status),
                        );
                    });
            });
    }

    delete(_id: Types.ObjectId) {
        return this.questionnaireModel.findByIdAndDelete(_id).exec();
    }

    private createQuestionnaireFromFileData(fileData: FileData[]) {
        const createdQuestionnaire = new this.questionnaireModel();
        const xlsFormParsed: XLSForm = new XLSForm(fileData);
        const settings = xlsFormParsed.getSettings();

        const createdQuestionnaireVersion = new this.questionnaireVersionModel();

        createdQuestionnaire.abbreviation = settings.form_id;
        createdQuestionnaire.language = settings.language ?? 'en';
        createdQuestionnaireVersion.name = settings.form_title;

        // TODO: add missing fields to settings
        // createdQuestionnaireVersion.license = questionnaireInput.license;
        //createdQuestionnaireVersion.copyright = questionnaireInput.copyright;
        //createdQuestionnaireVersion.timeToComplete =
        //    questionnaireInput.timeToComplete;

        let currentGroup: QuestionGroup = null;

        for (const questionData of xlsFormParsed.getQuestionData()) {
            if (questionData.type === questionType.END_GROUP) {
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

        const createdQuestionnairePromise = createdQuestionnaire.save();

        createdQuestionnaireVersion.questionnaire = createdQuestionnaire.id;

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
