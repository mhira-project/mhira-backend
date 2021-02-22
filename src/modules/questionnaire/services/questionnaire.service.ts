import { Injectable } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    CreateQuestionnaireInput,
    CreateRawQuestionnaireInput,
    ListQuestionnaireInput,
    UpdateQuestionnaireInput,
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
        private questionGroupModel: Model<QuestionGroup>,
        @InjectModel(Question.name)
        private questionModel: Model<Question>,
        @InjectModel(Choice.name)
        private choiceModel: Model<Choice>,
    ) {}

    public async createRaw(questionnaireInput: CreateRawQuestionnaireInput) {
        const createdQuestionnaire = new this.questionnaireModel();
        //createdQuestionnaire.language = questionnaireInput.language;

        // TODO: if same as existing one (formId and language) create a new version? this.checkIfExists? or something

        // createdQuestionnaireVersion.license = questionnaireInput.license;
        //createdQuestionnaireVersion.copyright = questionnaireInput.copyright;
        //createdQuestionnaireVersion.timeToComplete =
        //    questionnaireInput.timeToComplete;

        //const fileData = await xlsForm;

        const fileData: FileData[] = xlsx.parse(
            `${__dirname}/test-xls/PHQ-9.xlsx`,
        ) as any; // FIXME: remove after testing

        const xlsForm: XLSForm = new XLSForm(fileData);
        const settings = xlsForm.getSettings();

        const createdQuestionnaireVersion = new this.questionnaireVersionModel();

        createdQuestionnaire.abbreviation = settings.form_id;
        createdQuestionnaire.language = settings.language;
        createdQuestionnaireVersion.name = settings.form_title;

        let currentGroup: QuestionGroup = null;

        for (const questionData of xlsForm.getQuestionData()) {
            if (questionData.type === questionType.END_GROUP) {
                createdQuestionnaireVersion.questionGroups.push(currentGroup);
                currentGroup = null;
            } else {
                const question = XlsFormQuestionFactory.createQuestion(
                    questionData,
                    xlsForm,
                );

                if (question instanceof QuestionGroup) {
                    currentGroup = question;
                } else {
                    currentGroup.questions.push(question);
                }
            }
        }

        const version = await createdQuestionnaireVersion.save();

        createdQuestionnaire.versions = [version.id];

        return createdQuestionnaire.save();
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
        return this.questionnaireModel
            .findById(_id)
            .populate('versions')
            .exec();
    }

    update(payload: UpdateQuestionnaireInput) {
        // TODO: update questionnaire and create a new version out of it...
        /*return this.questionnaireModel
            .findByIdAndUpdate(payload._id, payload, { new: true })
            .exec();*/
    }

    list(filters: ListQuestionnaireInput) {
        return this.questionnaireModel.find({ ...filters }).exec();
    }

    delete(_id: Types.ObjectId) {
        return this.questionnaireModel.findByIdAndDelete(_id).exec();
    }
}
