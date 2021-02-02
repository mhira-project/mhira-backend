import { Injectable } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    CreateQuestionnaireInput,
    ListQuestionnaireInput,
    UpdateQuestionnaireInput,
} from '../dtos/questionnaire.input';
import { Questionnaire } from '../models/questionnaire.schema';

@Injectable()
export class QuestionnaireService {
    constructor(
        @InjectModel(Questionnaire.name)
        private questionnaireModel: Model<Questionnaire>,
    ) {}

    public async create(
        @Args('CreateQuestionnaireInput') { xlsForm }: CreateQuestionnaireInput,
    ) {
        const fileData = await xlsForm;
        // TODO: check if file was uploaded successfully and is an excel
        // TODO: go through each sheet and create groups from begin_group and create questions after
        // TODO: set settings for questionnaire, check if infos from sheet are enough.
        // TODO: save file after
        //const createdPerson = new this.personModel(payload);
        //return createdPerson.save();

        const createdQuestionnaire = new this.questionnaireModel();
        return createdQuestionnaire.save();
    }

    getById(_id: Types.ObjectId) {
        return this.questionnaireModel.findById(_id).exec();
    }

    update(payload: UpdateQuestionnaireInput) {
        /*return this.questionnaireModel
            .findByIdAndUpdate(payload._id, payload, { new: true })
            .exec();*/
    }

    list(filters: ListQuestionnaireInput) {
        //return this.questionnaireModel.find({ ...filters }).exec();
    }

    delete(_id: Types.ObjectId) {
        return this.questionnaireModel.findByIdAndDelete(_id).exec();
    }
}
