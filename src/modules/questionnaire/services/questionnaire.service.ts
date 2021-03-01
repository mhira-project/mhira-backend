import { Injectable } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    CreateQuestionnaireInput,
    CreateRawQuestionnaireInput,
    ListQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { Questionnaire } from '../models/questionnaire.schema';

import xlsx from 'node-xlsx';
import { Choice, Question, questionType } from '../models/question.schema';
import { QuestionGroup } from '../models/question-group.schema';
import { QuestionnaireVersion } from '../models/questionnaire-version.schema';
import { FileData, XLSForm } from '../helpers/xlsform-reader.helper';
import { XlsFormQuestionFactory } from '../helpers/xlsform-questions.factory';

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

    public async createRaw(questionnaireInput: CreateRawQuestionnaireInput) {
        const createdQuestionnaire = new this.questionnaireModel();
        //createdQuestionnaire.language = questionnaireInput.language;

        // TODO: if same as existing one (formId and language) create a new version? this.checkIfExists? or something

        //const fileData = await xlsForm;

        const fileData: FileData[] = xlsx.parse(
            `${__dirname}/test-xls/PHQ-9.xlsx`,
        ) as any; // FIXME: remove after testing

        const xlsForm: XLSForm = new XLSForm(fileData);
        const settings = xlsForm.getSettings();

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

        for (const questionData of xlsForm.getQuestionData()) {
            if (questionData.type === questionType.END_GROUP) {
                createdQuestionnaireVersion.questionGroups.push(currentGroup);
                currentGroup = null;
            } else {
                const question = XlsFormQuestionFactory.createQuestion(
                    questionData,
                    xlsForm,
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

        await createdQuestionnaireVersion.save();

        return createdQuestionnairePromise;
    }

    public async create(
        @Args('CreateQuestionnaireInput') { xlsForm }: CreateQuestionnaireInput,
    ) {
        const fileData = await xlsForm;

        // TODO: figure out proper way to get uploaded file

        //const { filename, mimetype, createReadStream } = fileData;

        //const fileData = xlsx.parse(`${__dirname}/../test-xlsx/PHQ-9.xlsx`); // FIXME: remove after testing

        //console.log(fileData);

        // TODO: check if file was uploaded successfully and is an excel
        // TODO: go through each sheet and create groups from begin_group and create questions after
        // TODO: set settings for questionnaire, check if infos from sheet are enough.
        // TODO: save file after

        //const createdQuestionnaire = new this.questionnaireModel();
        // return createdQuestionnaire.save();
        return new this.questionnaireModel();
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

    list(filters: ListQuestionnaireInput) {
        // TODO: filter versions too... Or maybe filter by versions and THEN find the questionnaire.

        //this.questionnaireVersionModel.find({ ...filters }).exec();

        return this.questionnaireModel.find({ ...filters }).exec();
    }

    delete(_id: Types.ObjectId) {
        return this.questionnaireModel.findByIdAndDelete(_id).exec();
    }
}
