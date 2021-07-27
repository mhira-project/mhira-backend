import { Answer } from '../models/answer.schema';
import { BasicValidator } from './basic.validation';
import { UserInputError } from 'apollo-server-express';

export class TextQuestionValidator extends BasicValidator {
    protected validate(answer: Answer): void {
        if (this.question.required && !answer.textValue.length) throw new UserInputError('Answer cannot be empty');
        if (this.question.max && answer.textValue.length > this.question.max) {
            throw new UserInputError(
                `Input given for question ${this.question.name} can only be ${this.question.max} chars long.`,
            );
        }
    }
}
