import { TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/typeorm';
import { Patient } from 'src/modules/patient/models/patient.model';
import { CaseManagerService } from 'src/modules/patient/providers/case-manager.service';
import { User } from 'src/modules/user/models/user.model';
import { lookupModule, StatementRecorder } from './database';

// Ticket 07, 07_D: assigning and unassigning a case manager writes the
// join table patient_case_manager through a query builder without an
// entity. The seed links patient 6 with user 3.

/** The lookup of a link before it is added. */
function lookup(patientId: number, userId: number): string {
    return `SELECT ... FROM "patient_case_manager" "patient_case_manager" WHERE "patient_case_manager"."patientId" = $1 AND "patient_case_manager"."userId" = $2 -- [${patientId},${userId}]`;
}

describe('case managers', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'lookups_case_managers',
            [Patient, User],
            [CaseManagerService],
        ));
    });

    afterAll(() => module.close());

    async function links(): Promise<string[]> {
        const rows: { patientId: number; userId: number }[] = await module
            .get(getConnectionToken())
            .query(
                'SELECT "patientId", "userId" FROM patient_case_manager ORDER BY 1, 2',
            );
        return rows.map(row => `${row.patientId}-${row.userId}`);
    }

    it('assigning an existing case manager finds the link and writes nothing', async () => {
        const { result, error, sql } = await recorder.observe(() =>
            module.get(CaseManagerService).assignPatientCaseManager(6, 3),
        );
        expect(error).toBeUndefined();
        expect(result).toBe(true);
        expect(await links()).toEqual(['6-3']);
        expect(sql).toEqual([lookup(6, 3)]);
    });

    it('assigning a new case manager adds the link', async () => {
        const { result, error, sql } = await recorder.observe(() =>
            module.get(CaseManagerService).assignPatientCaseManager(1, 2),
        );
        expect(error).toBeUndefined();
        expect(result).toBe(true);
        expect(await links()).toEqual(['1-2', '6-3']);
        expect(sql).toEqual([
            lookup(1, 2),
            'INSERT INTO "patient_case_manager"("patientId", "userId") VALUES ($1, $2) -- [1,2]',
        ]);
    });

    it('unassigning removes the link, and says whether there was one', async () => {
        const service = module.get(CaseManagerService);
        const removed = await recorder.observe(() =>
            service.unassignPatientCaseManager(1, 2),
        );
        expect(removed.error).toBeUndefined();
        expect(removed.result).toBe(true);
        expect(await links()).toEqual(['6-3']);
        expect(removed.sql).toEqual([
            'DELETE FROM "patient_case_manager" WHERE "patientId" = $1 AND "userId" = $2 -- [1,2]',
        ]);

        const absent = await recorder.observe(() =>
            service.unassignPatientCaseManager(1, 2),
        );
        expect(absent.result).toBe(false);
    });
});
