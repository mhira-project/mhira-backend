import { Answer } from '../models/answer.schema';
import { BasicValidator } from './basic.validation';

export class TextQuestionValidator extends BasicValidator {
    protected validate(answer: Answer): void {
        if (this.question.max && answer.textValue.length > this.question.max) {
            throw new Error(
                `Input given for question ${this.question.name} can only be ${this.question.max} chars long.`,
            );
        }
    }
}
