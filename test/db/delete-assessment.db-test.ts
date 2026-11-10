import { TestingModule } from '@nestjs/testing';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { AssessmentType } from 'src/modules/assessment/models/assessment-type.model';
import { AssessmentService } from 'src/modules/assessment/services/assessment.service';
import { Caregiver } from 'src/modules/caregiver/models/caregiver.model';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { User } from 'src/modules/user/models/user.model';
import { lookupModule, StatementRecorder } from './database';

// Ticket 07, 07_D, P1 (T2): deleteAssessment looks the assessment up by id,
// then, in one transaction, deletes the row (unless it only cancels) and has
// the Mongo side delete or cancel the document: the transaction commits
// when that succeeds and rolls back when it fails. P3 runs it on the
// injected connection, which TypeORM 0.3 needs.

const MISSING = 999999;

describe('deleteAssessment (P1, T2)', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;
    const deleteDocument = jest.fn();

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'lookups_delete',
            [Assessment, AssessmentType, Caregiver, User],
            [
                AssessmentService,
                {
                    provide: QuestionnaireAssessmentService,
                    useValue: { deleteAssessment: deleteDocument },
                },
                { provide: PatientQueryService, useValue: {} },
            ],
        ));
    });

    afterEach(() => deleteDocument.mockReset());
    afterAll(() => module.close());

    it('deletes the row and the document in one transaction, which commits', async () => {
        const start = recorder.statements.length;
        const { error, sql } = await recorder.observe(() =>
            module.get(AssessmentService).deleteAssessment(4, false),
        );
        const transaction = recorder.statements.slice(start + 1);
        expect(error).toBeUndefined();
        expect(deleteDocument).toHaveBeenCalledWith(
            '63cfdc2c47f5b40024688e7d',
            false,
        );
        expect(
            await Assessment.findOne({ where: { id: 4 }, withDeleted: true }),
        ).toBeUndefined();
        expect(sql).toEqual([
            'SELECT ... FROM "assessment" "Assessment" WHERE ( "Assessment"."id" IN ($1) ) AND ( "Assessment"."deletedAt" IS NULL ) -- [4]',
            'DELETE FROM "assessment" WHERE "id" IN ($1) -- [4]',
        ]);
        expect(transaction).toEqual([
            'START TRANSACTION',
            'DELETE FROM "assessment" WHERE "id" IN ($1) -- [4]',
            'COMMIT',
        ]);
    });

    it('rolls the row back when the document cannot be deleted', async () => {
        deleteDocument.mockRejectedValue(new Error('the Mongo side failed'));
        const start = recorder.statements.length;
        const { error } = await recorder.observe(() =>
            module.get(AssessmentService).deleteAssessment(3, false),
        );
        const transaction = recorder.statements.slice(start + 1);
        expect(error).toEqual(new Error('the Mongo side failed'));
        expect((await Assessment.findOne({ where: { id: 3 } })).id).toBe(3);
        expect(transaction).toEqual([
            'START TRANSACTION',
            'DELETE FROM "assessment" WHERE "id" IN ($1) -- [3]',
            'ROLLBACK',
        ]);
    });

    it('only cancels: the row stays, and the transaction holds no statement', async () => {
        const { error, sql } = await recorder.observe(() =>
            module.get(AssessmentService).deleteAssessment(1),
        );
        expect(error).toBeUndefined();
        expect(deleteDocument).toHaveBeenCalledWith(
            '63c67b43ea6e670024c8bca1',
            true,
        );
        expect((await Assessment.findOne({ where: { id: 1 } })).id).toBe(1);
        expect(sql).toEqual([
            'SELECT ... FROM "assessment" "Assessment" WHERE ( "Assessment"."id" IN ($1) ) AND ( "Assessment"."deletedAt" IS NULL ) -- [1]',
        ]);
    });

    it('refuses a missing assessment before the transaction', async () => {
        const { error, sql } = await recorder.observe(() =>
            module.get(AssessmentService).deleteAssessment(MISSING, false),
        );
        expect(error.name).toBe('EntityNotFound');
        expect(error.message).toBe(
            `Could not find any entity of type "Assessment" matching: ${MISSING}`,
        );
        expect(deleteDocument).not.toHaveBeenCalled();
        expect(sql).toEqual([
            `SELECT ... FROM "assessment" "Assessment" WHERE ( "Assessment"."id" IN ($1) ) AND ( "Assessment"."deletedAt" IS NULL ) -- [${MISSING}]`,
        ]);
    });
});
