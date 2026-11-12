import { TestingModule } from '@nestjs/testing';
import { EntityNotFoundError } from 'typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { AssessmentType } from 'src/modules/assessment/models/assessment-type.model';
import { AssessmentService } from 'src/modules/assessment/services/assessment.service';
import { Caregiver } from 'src/modules/caregiver/models/caregiver.model';
import { Patient } from 'src/modules/patient/models/patient.model';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { User } from 'src/modules/user/models/user.model';
import { lookupModule, StatementRecorder, whereLive } from './database';
import { newAssessment, newPatient } from './rows';

// deleteAssessment looks the assessment up by id, then, in one transaction,
// deletes the row (unless it only cancels) and has the Mongo side delete or
// cancel the document: the transaction commits when that succeeds and rolls
// back when it fails. The Mongo side is a stub here.

const MISSING = 999999;

/** The lookup of an assessment by id. */
function byId(id: number): string {
    return `SELECT ... FROM "assessment" "Assessment" ${whereLive(
        'Assessment',
        '"Assessment"."id" = $1',
    )} LIMIT 1 -- [${id}]`;
}

describe('deleteAssessment', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;
    let service: AssessmentService;
    let assessment: Assessment;
    const deleteDocument = jest.fn();

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'mhira_test_delete_assessment',
            [Assessment, AssessmentType, Caregiver, Patient, User],
            [
                AssessmentService,
                {
                    provide: QuestionnaireAssessmentService,
                    useValue: { deleteAssessment: deleteDocument },
                },
                { provide: PatientQueryService, useValue: {} },
            ],
        ));
        service = module.get(AssessmentService);
    });

    beforeEach(async () => {
        assessment = await newAssessment(await newPatient());
    });

    afterEach(() => deleteDocument.mockReset());
    afterAll(() => module.close());

    /** Whether the assessment's row is still there. */
    async function stored(): Promise<boolean> {
        return (
            (await Assessment.count({
                where: { id: assessment.id },
                withDeleted: true,
            })) === 1
        );
    }

    it('deletes the row and the document in one transaction, which commits', async () => {
        const start = recorder.statements.length;
        const { error, sql } = await recorder.observe(() =>
            service.deleteAssessment(assessment.id, false),
        );
        const transaction = recorder.statements.slice(start + 1);
        const deletion = `DELETE FROM "assessment" WHERE "id" IN ($1) -- [${assessment.id}]`;

        expect(error).toBeUndefined();
        expect(deleteDocument).toHaveBeenCalledWith(
            assessment.questionnaireAssessmentId,
            false,
        );
        expect(await stored()).toBe(false);
        expect(sql).toEqual([byId(assessment.id), deletion]);
        expect(transaction).toEqual(['START TRANSACTION', deletion, 'COMMIT']);
    });

    it('rolls the row back when the document cannot be deleted', async () => {
        deleteDocument.mockRejectedValue(new Error('the Mongo side failed'));
        const start = recorder.statements.length;
        const { error } = await recorder.observe(() =>
            service.deleteAssessment(assessment.id, false),
        );
        const transaction = recorder.statements.slice(start + 1);

        expect(error).toEqual(new Error('the Mongo side failed'));
        expect(await stored()).toBe(true);
        expect(transaction).toEqual([
            'START TRANSACTION',
            `DELETE FROM "assessment" WHERE "id" IN ($1) -- [${assessment.id}]`,
            'ROLLBACK',
        ]);
    });

    it('only cancels: the row stays, and the transaction holds no statement', async () => {
        const { error, sql } = await recorder.observe(() =>
            service.deleteAssessment(assessment.id),
        );
        expect(error).toBeUndefined();
        expect(deleteDocument).toHaveBeenCalledWith(
            assessment.questionnaireAssessmentId,
            true,
        );
        expect(await stored()).toBe(true);
        expect(sql).toEqual([byId(assessment.id)]);
    });

    it('refuses a missing assessment before the transaction', async () => {
        const { error, sql } = await recorder.observe(() =>
            service.deleteAssessment(MISSING, false),
        );
        expect(error).toBeInstanceOf(EntityNotFoundError);
        expect(error.message).toBe(
            `Could not find any entity of type "Assessment" matching: ${MISSING}`,
        );
        expect(deleteDocument).not.toHaveBeenCalled();
        expect(sql).toEqual([byId(MISSING)]);
    });
});
