// person.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    CreateQuestionnaireInput,
    ListQuestionnaireInput,
} from '../dtos/questionnaire.input';
import {
    Questionnaire,
    QuestionnaireDocument,
} from '../models/questionnaire.schema.model';

@Injectable()
export class QuestionnaireService {
    constructor(
        @InjectModel(Questionnaire.name)
        private questionnaireModel: Model<QuestionnaireDocument>,
    ) {}

    create(payload: CreateQuestionnaireInput) {
        // TODO: check if file was uploaded successfully and is an excel
        // TODO: go through each sheet and create groups from begin_group and create questions after
        // TODO: set settings for questionnaire, check if infos from sheet are enough.
        // TODO: save file after
        //const createdPerson = new this.personModel(payload);
        //return createdPerson.save();
    }

    getById(_id: Types.ObjectId) {
        return this.questionnaireModel.findById(_id).exec();
    }

    list(filters: ListQuestionnaireInput) {
        return this.questionnaireModel.find({ ...filters }).exec();
    }

    /*update(payload: UpdatePersonInput) {
        return this.personModel
            .findByIdAndUpdate(payload._id, payload, { new: true })
            .exec();
    }*/

    delete(_id: Types.ObjectId) {
        return this.questionnaireModel.findByIdAndDelete(_id).exec();
    }
}
