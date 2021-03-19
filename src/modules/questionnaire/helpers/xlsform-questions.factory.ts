import { QuestionGroup } from '../models/question-group.schema';
import { Choice, Question, questionType } from '../models/question.schema';
import { QuestionData, XLSForm } from './xlsform-reader.helper';

export class XlsFormQuestionFactory {
    public static createQuestion(
        questionRow: Partial<QuestionData>,
        xlsForm: XLSForm,
        question: Question,
        questionGroup: QuestionGroup,
    ): Question | QuestionGroup {
        if (questionRow.type === questionType.BEGIN_GROUP) {
            questionGroup.label = questionRow.label;
            return questionGroup;
        } else {
            question = {
                ...question,
                ...questionRow,
                constraintMessage: questionRow.constraint_message,
                requiredMessage: questionRow.required_message,
                max: questionRow.max_length,
                min: questionRow.min_length,
            } as Question;
            // TODO: maybe make invalid column check here...

            if (
                questionRow.type?.startsWith(questionType.SELECT_ONE) ||
                questionRow.type?.startsWith(questionType.SELECT_MULTIPLE)
            ) {
                const questionType = questionRow.type?.split(' ');
                const listName = questionType[1];
                question.type = questionType[0];
                const choices: Choice[] = xlsForm
                    .getChoiceData()
                    .filter(item => item.list_name === listName)
                    .map(
                        choice =>
                            ({
                                label: choice.label,
                                name: choice.name,
                                image: choice['media::image'],
                            } as Choice),
                    );

                question.choices = choices;
            }

            if (question.type === questionType.TEXT && !!question.max) {
                throw new Error(
                    'Maxlength needs to be configured for textfields',
                );
            }
            // TODO: add validation for some fields like maxlength needs to be set for text fields, etc.

            return question;
        }
    }
}
