import { Answer } from '../models/answer.schema';
import { BasicValidator } from './basic.validation';
import { UserInputError } from 'apollo-server-express';

export class NumberQuestionValidator extends BasicValidator {
    protected validate(answer: Answer): void {
        if (this.question.required && answer.numberValue === null) throw new UserInputError('Answer cannot be empty');
        if (this.question.max && answer.numberValue > this.question.max) {
            throw new UserInputError(
                `Number given for question ${this.question.name} is too high. Can only be ${this.question.max} or below.`,
            );
        }
    }
}
