import { Question, QuestionType } from '../models/question.schema';
import { ChoiceQuestionValidator } from '../validation/choice.validation';
import { QuestionValidator } from '../validation/question.validation';
import { NumberQuestionValidator } from '../validation/number.validation';
import { TextQuestionValidator } from '../validation/text.validation';
import { BasicValidator } from '../validation/basic.validation';

export class QuestionValidatorFactory {
    public static getValidatorForQuestion(question: Question): BasicValidator {
        switch (question.type) {
            case QuestionType.SELECT_MULTIPLE:
            case QuestionType.SELECT_ONE:
            case QuestionType.VISUAL_ANALOG_SCALES:
                return new ChoiceQuestionValidator(question);
            case QuestionType.INTEGER:
            case QuestionType.DECIMAL:
                return new NumberQuestionValidator(question);
            case QuestionType.TEXT:
                return new TextQuestionValidator(question);
            default:
                return new QuestionValidator(question);
        }
    }
}
