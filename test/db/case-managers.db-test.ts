import { TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Patient } from 'src/modules/patient/models/patient.model';
import { CaseManagerService } from 'src/modules/patient/providers/case-manager.service';
import { User } from 'src/modules/user/models/user.model';
import { lookupModule, StatementRecorder } from './database';
import { newPatient, newUser } from './rows';

// Assigning and unassigning a case manager writes the join table
// patient_case_manager through a query builder without an entity.

/** The lookup of a link before it is added. */
function lookup(patient: Patient, user: User): string {
    return `SELECT ... FROM "patient_case_manager" "patient_case_manager" WHERE ("patient_case_manager"."patientId" = $1 AND "patient_case_manager"."userId" = $2) -- [${patient.id},${user.id}]`;
}

describe('case managers', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;
    let service: CaseManagerService;
    let patient: Patient;
    let user: User;

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'mhira_test_case_managers',
            [Patient, User],
            [CaseManagerService],
        ));
        service = module.get(CaseManagerService);
    });

    beforeEach(async () => {
        patient = await newPatient();
        user = await newUser();
    });

    afterAll(() => module.close());

    /** The ids of the patient's case managers. */
    async function caseManagers(): Promise<number[]> {
        const rows: { userId: number }[] = await module
            .get(getDataSourceToken())
            .query(
                'SELECT "userId" FROM patient_case_manager WHERE "patientId" = $1',
                [patient.id],
            );
        return rows.map(row => row.userId);
    }

    it('assigning a new case manager adds the link', async () => {
        const { result, error, sql } = await recorder.observe(() =>
            service.assignPatientCaseManager(patient.id, user.id),
        );
        expect(error).toBeUndefined();
        expect(result).toBe(true);
        expect(await caseManagers()).toEqual([user.id]);
        expect(sql).toEqual([
            lookup(patient, user),
            `INSERT INTO "patient_case_manager"("patientId", "userId") VALUES ($1, $2) -- [${patient.id},${user.id}]`,
        ]);
    });

    it('assigning an existing case manager finds the link and writes nothing', async () => {
        await service.assignPatientCaseManager(patient.id, user.id);

        const { result, error, sql } = await recorder.observe(() =>
            service.assignPatientCaseManager(patient.id, user.id),
        );
        expect(error).toBeUndefined();
        expect(result).toBe(true);
        expect(await caseManagers()).toEqual([user.id]);
        expect(sql).toEqual([lookup(patient, user)]);
    });

    it('unassigning removes the link, and says whether there was one', async () => {
        await service.assignPatientCaseManager(patient.id, user.id);

        const removed = await recorder.observe(() =>
            service.unassignPatientCaseManager(patient.id, user.id),
        );
        expect(removed.error).toBeUndefined();
        expect(removed.result).toBe(true);
        expect(await caseManagers()).toEqual([]);
        expect(removed.sql).toEqual([
            `DELETE FROM "patient_case_manager" WHERE ("patientId" = $1 AND "userId" = $2) -- [${patient.id},${user.id}]`,
        ]);

        const absent = await recorder.observe(() =>
            service.unassignPatientCaseManager(patient.id, user.id),
        );
        expect(absent.result).toBe(false);
    });
});
