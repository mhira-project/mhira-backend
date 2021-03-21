import { Answer } from '../models/answer.schema';
import { BasicValidator } from './basic.validation';

export class QuestionValidator extends BasicValidator {
    protected validate(answer: Answer) {
        // doesn't need validation because this is the most basic validation for simple types
    }
}
