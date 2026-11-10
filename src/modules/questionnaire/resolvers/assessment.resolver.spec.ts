import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { AnswerAssessmentInput } from '../dtos/assessment.input';
import { AssessmentStatus } from '../enums/assessment-status.enum';
import { QuestionnaireAssessment } from '../models/questionnaire-assessment.schema';
import { QuestionnaireAssessmentService } from '../services/questionnaire-assessment.service';
import { AssessmentResolver } from './assessment.resolver';

// BUGS.md, B02: `addAnswer` changes the status to PARTIALLY_COMPLETED and
// then saves the answer. The status change must have finished before the
// answer's save starts, so the two never load and save the same document
// side by side. A failed status change is logged and dropped, and the
// answer is still saved; a refused answer still comes after the status
// change, as on v1.1.6 (B36).

const ASSESSMENT_ID = Types.ObjectId('5f1d7f3b9d3e2a0012345678');
const INPUT = ({
    assessmentId: ASSESSMENT_ID,
} as unknown) as AnswerAssessmentInput;
const SAVED = ({ _id: ASSESSMENT_ID } as unknown) as QuestionnaireAssessment;

/** A promise and the functions that settle it, to hold a call open. */
function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

// Enough turns of the event loop for every pending step of `addAnswer` to
// run, so a call that is not made has really not been made.
async function settle() {
    for (let turn = 0; turn < 10; turn++) {
        await new Promise(resolve => setImmediate(resolve));
    }
}

describe('AssessmentResolver.addAnswer', () => {
    let changeAssessmentStatus: jest.Mock;
    let addAnswerToAssessment: jest.Mock;
    let resolver: AssessmentResolver;
    let loggedErrors: string[];
    let unhandled: unknown[];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);

    beforeEach(() => {
        changeAssessmentStatus = jest.fn();
        addAnswerToAssessment = jest.fn().mockResolvedValue(SAVED);
        resolver = new AssessmentResolver(({
            changeAssessmentStatus,
            addAnswerToAssessment,
        } as unknown) as QuestionnaireAssessmentService);
        loggedErrors = [];
        unhandled = [];
        process.on('unhandledRejection', onUnhandled);
        jest.spyOn(Logger.prototype, 'error').mockImplementation(
            (message: string) => {
                loggedErrors.push(message);
            },
        );
    });

    afterEach(() => {
        process.off('unhandledRejection', onUnhandled);
        jest.restoreAllMocks();
    });

    it('saves the answer only after the status change has finished', async () => {
        const status = deferred<QuestionnaireAssessment>();
        changeAssessmentStatus.mockReturnValue(status.promise);

        const result = resolver.addAnswer(INPUT);
        await settle();
        expect(changeAssessmentStatus).toHaveBeenCalledWith(
            ASSESSMENT_ID,
            AssessmentStatus.PARTIALLY_COMPLETED,
        );
        expect(addAnswerToAssessment).not.toHaveBeenCalled();

        status.resolve(SAVED);
        await expect(result).resolves.toBe(SAVED);
        expect(addAnswerToAssessment).toHaveBeenCalledWith(INPUT);
        expect(loggedErrors).toEqual([]);
    });

    it('logs a failed status change once, drops it and still saves the answer', async () => {
        const status = deferred<QuestionnaireAssessment>();
        changeAssessmentStatus.mockReturnValue(status.promise);

        const result = resolver.addAnswer(INPUT);
        await settle();
        expect(addAnswerToAssessment).not.toHaveBeenCalled();

        status.reject(new Error('No matching document found'));
        await expect(result).resolves.toBe(SAVED);
        expect(addAnswerToAssessment).toHaveBeenCalledWith(INPUT);
        expect(loggedErrors).toEqual([
            `addAnswer: the status change to PARTIALLY_COMPLETED of assessment ${ASSESSMENT_ID} failed and was dropped (B02)`,
        ]);
        await settle();
        expect(unhandled).toEqual([]);
    });

    it('changes the status before an answer that is then refused, and returns the refusal', async () => {
        changeAssessmentStatus.mockResolvedValue(SAVED);
        const refusal = new Error(
            'You cannot add any more answers to this assessment.',
        );
        addAnswerToAssessment.mockRejectedValue(refusal);

        await expect(resolver.addAnswer(INPUT)).rejects.toBe(refusal);
        expect(changeAssessmentStatus).toHaveBeenCalledTimes(1);
        expect(changeAssessmentStatus.mock.invocationCallOrder[0]).toBeLessThan(
            addAnswerToAssessment.mock.invocationCallOrder[0],
        );
    });
});
