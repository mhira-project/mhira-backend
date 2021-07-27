import { Answer } from '../models/answer.schema';
import { Question, QuestionType } from '../models/question.schema';
import { UserInputError } from 'apollo-server-express';

export abstract class BasicValidator {
    constructor(protected question: Question) { }
    protected abstract validate(answer: Answer);
    public isValid(answer: Answer): boolean {
        const answerSet = answer.textValue
            ?? answer.multipleChoiceValue
            ?? answer.booleanValue
            ?? answer.numberValue
            ?? answer.dateValue
            ?? (this.question.type === QuestionType.NOTE ? true : undefined);

        if (this.question.required && (answerSet === undefined || answerSet === null)) {
            throw new UserInputError(
                this.question.requiredMessage ??
                `Question '${this.question.name}' is required.`,
            );
        }
        this.validate(answer);

        return true;
    }
}
