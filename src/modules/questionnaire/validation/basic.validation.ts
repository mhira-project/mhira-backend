import { Answer } from '../models/answer.schema';
import { Question, QuestionType } from '../models/question.schema';

export abstract class BasicValidator {
    constructor(protected question: Question) {}
    protected abstract validate(answer: Answer);
    public isValid(answer: Answer): boolean {
        const answerSet =
            !!answer.textValue ||
            !!answer.multipleChoiceValue ||
            !!answer.booleanValue ||
            !!answer.numberValue ||
            !!answer.dateValue ||
            this.question.type === QuestionType.NOTE;

        if (this.question.required && !answerSet) {
            throw new Error(
                this.question.requiredMessage ??
                    `Question '${this.question.name}' is required.`,
            );
        }
        this.validate(answer);

        return true;
    }
}
