import { Answer } from '../models/answer.schema';
import { QuestionType } from '../models/question.schema';
import { BasicValidator } from './basic.validation';
import { UserInputError } from 'apollo-server-express';

export class ChoiceQuestionValidator extends BasicValidator {
    protected validate(answer: Answer) {
        const choices = this.question.choices.map(choice => choice.name);

        if (this.question.required && (
            (this.question.type === QuestionType.SELECT_ONE && (answer.textValue === null || answer.textValue === undefined)) ||
            (this.question.type === QuestionType.SELECT_MULTIPLE && !answer.multipleChoiceValue?.length)
        )) {
            throw new UserInputError('Answer cannot be empty');
        }

        if (
            answer.multipleChoiceValue &&
            (answer.multipleChoiceValue.length < this.question.min ||
                answer.multipleChoiceValue.length > this.question.max)
        ) {
            throw new UserInputError(
                `Number of answers must be between ${this.question.min} and ${this.question.max}`,
            );
        }

        if (
            (this.question.type === QuestionType.SELECT_ONE && !choices.includes(answer.textValue)) ||
            (this.question.type === QuestionType.SELECT_MULTIPLE && answer.multipleChoiceValue?.some(av => !choices.includes(av)))
        ) {
            throw new UserInputError(`Please only choose available answers!`);
        }
    }
}
