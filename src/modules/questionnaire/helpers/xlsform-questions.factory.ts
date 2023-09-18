import { QuestionGroup } from '../models/question-group.schema';
import { Choice, Question, QuestionType } from '../models/question.schema';
import { XLSForm } from './xlsform-reader.helper';
import { QuestionData } from '../dtos/xlsform.dto';

export class XlsFormQuestionFactory {
    public static createQuestion(
        questionRow: Partial<QuestionData>,
        xlsForm: XLSForm,
        question: Question,
        questionGroup: QuestionGroup,
    ): Question | QuestionGroup {
        if (questionRow.type === QuestionType.BEGIN_GROUP) {
            questionGroup.label = questionRow.label;
            questionGroup.appearance = questionRow.appearance;
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
                questionRow.type?.startsWith(QuestionType.SELECT_ONE) ||
                questionRow.type?.startsWith(QuestionType.SELECT_MULTIPLE)
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

            if (question.type === QuestionType.TEXT && !!question.max) {
                throw new Error(
                    'Maxlength needs to be configured for textfields',
                );
            }
            // TODO: add validation for some fields like maxlength needs to be set for text fields, etc.

            return question;
        }
    }
}
