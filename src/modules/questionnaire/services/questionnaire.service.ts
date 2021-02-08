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

@Injectable()
export class QuestionnaireService {
    constructor(
        @InjectModel(Questionnaire.name)
        private questionnaireModel: Model<Questionnaire>,
        @InjectModel(QuestionGroup.name)
        private questionGroupModel: Model<QuestionGroup>,
        @InjectModel(Question.name)
        private questionModel: Model<Question>,
        @InjectModel(Choice.name)
        private choiceModel: Model<Choice>,
    ) {}

    public async createRaw(questionnaireInput: CreateRawQuestionnaireInput) {
        const createdQuestionnaire = new this.questionnaireModel();
        createdQuestionnaire.language = questionnaireInput.language;
        createdQuestionnaire.license = questionnaireInput.license;
        createdQuestionnaire.copyright = questionnaireInput.copyright;
        createdQuestionnaire.timeToComplete = questionnaireInput.timeToComplete;

        // const fileData = await xlsForm;

        const fileData = xlsx.parse(`${__dirname}/test-xls/PHQ-9.xlsx`); // FIXME: remove after testing

        // link column names to attributes.
        let settings = fileData.filter(sheet => sheet.name === 'settings')[0]
            ?.data;

        let survey = fileData
            .filter(sheet => sheet.name === 'survey')[0]
            ?.data.filter(item => !!item);

        let surveyRowDefinitions = survey[0] as string[]; // get row definitions

        let choices = fileData.filter(sheet => sheet.name === 'choices')[0]
            ?.data;
        const choiceColumnDefinitions = choices[0];

        var currentGroup: QuestionGroup = null;
        for (
            let surveyItemIndex = 1;
            surveyItemIndex < survey.length;
            surveyItemIndex++
        ) {
            let surveyItem = survey[surveyItemIndex];
            if (!surveyItem) break;

            let type: string = surveyItem[
                surveyRowDefinitions.indexOf('type')
            ] as string;

            if (!type) break;

            let label: string = surveyItem[
                surveyRowDefinitions.indexOf('label')
            ] as string;
            let name: string = surveyItem[
                surveyRowDefinitions.indexOf('name')
            ] as string;

            if (type === questionType.BEGIN_GROUP) {
                currentGroup = new this.questionGroupModel();
                currentGroup.isNew = true;
                currentGroup.label = label;
                currentGroup.questions = [];
            } else if (type === questionType.END_GROUP) {
                createdQuestionnaire?.questionGroups?.push(currentGroup);

                currentGroup = null;
            } else {
                var question = new this.questionModel();
                question.name = name;
                question.label = label;
                question.type = type;
                if (
                    question.type &&
                    (question.type.startsWith(
                        questionType.SELECT_MULTIPLE.toString(),
                    ) ||
                        question.type.startsWith(
                            questionType.SELECT_ONE.toString(),
                        ))
                ) {
                    let choiceList = question.type.split(' ');
                    let choiceListName = choiceList[1];
                    question.type = choiceList[0];

                    question.choices = [];
                    choices
                        .filter(
                            (data, index) =>
                                index > 1 &&
                                (data[
                                    choiceColumnDefinitions.indexOf('list_name')
                                ] as string) === choiceListName,
                        )
                        .forEach(choice => {
                            let choiceEntity = new this.choiceModel();
                            choiceEntity.name = choice[
                                choiceColumnDefinitions.indexOf('name')
                            ] as string;
                            choiceEntity.label = choice[
                                choiceColumnDefinitions.indexOf('label')
                            ] as string;
                            choiceEntity.image = choice[
                                choiceColumnDefinitions.indexOf('image')
                            ] as string;

                            question?.choices?.push(choiceEntity);
                        });
                }
                currentGroup?.questions?.push(question);
            }
        }

        return createdQuestionnaire.save();
    }

    public async create(
        @Args('CreateQuestionnaireInput') { xlsForm }: CreateQuestionnaireInput,
    ) {
        const fileData = await xlsForm;
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
