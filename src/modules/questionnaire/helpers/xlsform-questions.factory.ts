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
            question = <Question>{
                ...question,
                ...questionRow,
            };

            // TODO: maybe make invalid column check here...

            question.constraintMessage = questionRow.constraint_message;
            question.requiredMessage = questionRow.required_message;
            question.max = questionRow.max_length;
            question.min = questionRow.min_length;

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
                    .map(choice => {
                        return <Choice>{
                            label: choice.label,
                            name: choice.name,
                            image: choice['media::image'],
                        };
                    });

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
