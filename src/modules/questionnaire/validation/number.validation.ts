import { Answer } from '../models/answer.schema';
import { BasicValidator } from './basic.validation';

export class NumberQuestionValidator extends BasicValidator {
    protected validate(answer: Answer): void {
        if (this.question.max && answer.numberValue > this.question.max) {
            throw new Error(
                `Number given for question ${this.question.name} is too high. Can only be ${this.question.max} or below.`,
            );
        }
    }
}
