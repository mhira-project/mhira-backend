import { model } from 'mongoose';
import {
    Questionnaire,
    QuestionnaireSchema,
    QuestionnaireStatus,
} from './questionnaire.schema';

// What `updateQuestionnaire` may store as a questionnaire's status. v1.1.6
// (Mongoose 5) refuses null with the enum validator's error, which reaches
// the client in full; from Mongoose 8 the enum validator lets null through
// (ticket 07, step 07). These are v1.1.6's answers, and they must not
// change.

const QuestionnaireModel = model(Questionnaire.name, QuestionnaireSchema);

function statusError(status: unknown) {
    return new QuestionnaireModel({ status }).validateSync()?.errors.status;
}

describe('Questionnaire status', () => {
    it.each(Object.values(QuestionnaireStatus))('accepts %s', status => {
        expect(statusError(status)).toBeUndefined();
    });

    it('takes DRAFT when the status is left out', () => {
        const questionnaire = new QuestionnaireModel({});
        expect(questionnaire.validateSync()?.errors.status).toBeUndefined();
        expect(questionnaire.status).toBe(QuestionnaireStatus.DRAFT);
    });

    it('refuses null with the enum validator error v1.1.6 sends', () => {
        // As the client gets it, in the error's extensions.
        expect(JSON.parse(JSON.stringify(statusError(null)))).toEqual({
            name: 'ValidatorError',
            message: '`null` is not a valid enum value for path `status`.',
            properties: {
                message: '`null` is not a valid enum value for path `status`.',
                type: 'enum',
                enumValues: ['DRAFT', 'PUBLISHED', 'PRIVATE'],
                path: 'status',
                value: null,
            },
            kind: 'enum',
            path: 'status',
            value: null,
        });
    });

    it('refuses a value outside the enum with the same error', () => {
        expect(statusError('ARCHIVED')).toMatchObject({
            message: '`ARCHIVED` is not a valid enum value for path `status`.',
            kind: 'enum',
        });
    });
});
