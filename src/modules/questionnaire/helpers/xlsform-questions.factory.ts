import { Model } from 'mongoose';
import { QuestionGroup } from '../models/question-group.schema';
import { Question } from '../models/question.schema';
import { questionData, XLSForm } from './xlsform-reader.helper';

export class XlsFormQuestionFactory {
    createQuestion(
        questionRow: Partial<questionData>,
        xlsForm: XLSForm,
    ): Model<Question> | Model<QuestionGroup> {
        return null;
    }
}
