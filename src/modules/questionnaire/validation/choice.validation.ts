import { Answer } from '../models/answer.schema';
import { QuestionType } from '../models/question.schema';
import { BasicValidator } from './basic.validation';

export class ChoiceQuestionValidator extends BasicValidator {
    protected validate(answer: Answer) {
        const choices = this.question.choices.map(choice => choice.name);

        if (
            answer.multipleChoiceValue &&
            (answer.multipleChoiceValue.length < this.question.min ||
                answer.multipleChoiceValue.length > this.question.max)
        ) {
            throw new Error(
                `Number of answers must be between ${this.question.min} and ${this.question.max}`,
            );
        }

        if (
            (this.question.type === QuestionType.SELECT_ONE && !choices.includes(answer.textValue)) ||
            (this.question.type === QuestionType.SELECT_MULTIPLE && answer.multipleChoiceValue?.some(av => !choices.includes(av)))
        ) {
            throw new Error(`Please only choose available answers!`);
        }
    }
}
