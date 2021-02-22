import { QuestionGroup } from '../models/question-group.schema';
import { Choice, Question, questionType } from '../models/question.schema';
import { questionData, XLSForm } from './xlsform-reader.helper';

export class XlsFormQuestionFactory {
    public static createQuestion(
        questionRow: Partial<questionData>,
        xlsForm: XLSForm,
    ): Question | QuestionGroup {
        if (questionRow.type === questionType.BEGIN_GROUP) {
            const questionGroup = new QuestionGroup();
            questionGroup.label = questionRow.label;
            return questionGroup;
        } else {
            const question: Question = <Question>{
                ...new Question(),
                ...questionRow,
            };

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

            // TODO: add validation for some fields like maxlength needs to be set for text fields, etc.

            return question;
        }
    }
}
