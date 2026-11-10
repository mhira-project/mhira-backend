import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthenticationError } from 'apollo-server-express';
import { Repository } from 'typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { AssessmentType } from 'src/modules/assessment/models/assessment-type.model';
import { AssessmentService } from 'src/modules/assessment/services/assessment.service';
import { AccessTokenService } from 'src/modules/auth/providers/access-token.service';
import { Caregiver } from 'src/modules/caregiver/models/caregiver.model';
import { PatientCaregiver } from 'src/modules/caregiver/models/patient-caregiver.model';
import { PatientCaregiverService } from 'src/modules/caregiver/services/patient.caregiver.service';
import { Patient } from 'src/modules/patient/models/patient.model';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';
import { PatientStatusService } from 'src/modules/patient/providers/patient-status.service';
import { PatientResolver } from 'src/modules/patient/resolvers/patient.resolver';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { QuestionnaireScriptService } from 'src/modules/questionnaire/services/questionnaire-script.service';
import { User } from 'src/modules/user/models/user.model';
import { CacheService } from 'src/shared';
import { lookupModule, StatementRecorder } from './database';

// Ticket 07, 07_D, P1 (T1): `null` and `undefined` in conditions. TypeORM
// 0.2 turns a `null` value into `IS NULL`; 0.3 drops the condition unless
// `invalidWhereValuesBehavior.null` is `sql-null` (step 11). An `undefined`
// value finds no row on 0.2, and throws on 0.3 with `undefined: 'throw'`;
// either way never a row. The backend's own guards keep `undefined` away from
// the lookups that could see it.

const DOCUMENT = {
    id: '63c67b43ea6e670024c8bca1',
    questionnaires: [],
    deleteOne: jest.fn(),
};

describe('null and undefined in conditions (P1, T1)', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'lookups_null',
            [
                Assessment,
                AssessmentType,
                Caregiver,
                Patient,
                PatientCaregiver,
                User,
            ],
            [
                AssessmentService,
                AccessTokenService,
                PatientCaregiverService,
                PatientQueryService,
                PatientResolver,
                { provide: JwtService, useValue: {} },
                { provide: CacheService, useValue: {} },
                { provide: PatientStatusService, useValue: {} },
                { provide: QuestionnaireScriptService, useValue: {} },
                {
                    provide: QuestionnaireAssessmentService,
                    useValue: {
                        createNewAssessment: jest
                            .fn()
                            .mockResolvedValue(DOCUMENT),
                        changeAssessmentStatus: jest.fn(),
                    },
                },
            ],
        ));
    });

    afterAll(() => module.close());

    describe("the caregiver insert's existence check spreads the input into its conditions", () => {
        // The seed's links: patient 1 with caregiver 1 ("Mother", emergency
        // false), patient 1 with caregiver 2 ("External Psychotherapist",
        // emergency and note NULL), patient 91 with caregiver 4 ("Mother",
        // emergency and note NULL).

        it('a value is compared with =, and an existing link is refused', async () => {
            const { error, sql } = await recorder.observe(() =>
                module.get(PatientCaregiverService).insert({
                    patientId: 1,
                    caregiverId: 1,
                    relation: 'Mother',
                }),
            );
            expect(error).toEqual(new ConflictException());
            expect(sql).toEqual([
                'SELECT ... FROM "patient_caregiver" "PatientCaregiver" WHERE ( "PatientCaregiver"."patientId" = $1 AND "PatientCaregiver"."caregiverId" = $2 AND "PatientCaregiver"."relation" = $3 ) AND ( "PatientCaregiver"."deletedAt" IS NULL ) LIMIT 1 -- [1,1,"Mother"]',
            ]);
        });

        it('null is IS NULL: it finds the link whose column is NULL, which is then refused', async () => {
            const { error, sql } = await recorder.observe(() =>
                module.get(PatientCaregiverService).insert({
                    patientId: 1,
                    caregiverId: 2,
                    emergency: null,
                    note: null,
                }),
            );
            expect(error).toEqual(new ConflictException());
            expect(sql).toEqual([
                'SELECT ... FROM "patient_caregiver" "PatientCaregiver" WHERE ( "PatientCaregiver"."patientId" = $1 AND "PatientCaregiver"."caregiverId" = $2 AND "PatientCaregiver"."emergency" IS NULL AND "PatientCaregiver"."note" IS NULL ) AND ( "PatientCaregiver"."deletedAt" IS NULL ) LIMIT 1 -- [1,2]',
            ]);
        });

        it('null is IS NULL: it does not find a link whose column has a value, so the insert goes ahead and the unique pair refuses it', async () => {
            const { error, sql } = await recorder.observe(() =>
                module
                    .get(PatientCaregiverService)
                    .insert({ patientId: 91, caregiverId: 4, relation: null }),
            );
            // v1.1.6's answer; were null dropped from the conditions, the
            // existing link would be found and refused as a conflict instead.
            expect(error.name).toBe('QueryFailedError');
            expect(error.message).toBe(
                'duplicate key value violates unique constraint "UQ_d1984b08df9e3fba76965be4aa3"',
            );
            expect(sql[0]).toBe(
                'SELECT ... FROM "patient_caregiver" "PatientCaregiver" WHERE ( "PatientCaregiver"."patientId" = $1 AND "PatientCaregiver"."caregiverId" = $2 AND "PatientCaregiver"."relation" IS NULL ) AND ( "PatientCaregiver"."deletedAt" IS NULL ) LIMIT 1 -- [91,4]',
            );
            expect(
                await PatientCaregiver.count({
                    where: { patientId: 91, caregiverId: 4 },
                }),
            ).toBe(1);
        });
    });

    it('update with a null condition is IS NULL and changes exactly the rows whose column is NULL', async () => {
        const links = module.get<Repository<PatientCaregiver>>(
            getRepositoryToken(PatientCaregiver),
        );
        const { result, error, sql } = await recorder.observe(() =>
            links.update({ patientId: 1, emergency: null }, { note: 'P1' }),
        );
        expect(error).toBeUndefined();
        expect(result.affected).toBe(1);
        expect(
            (await links.findOne({ where: { patientId: 1, caregiverId: 2 } }))
                .note,
        ).toBe('P1');
        expect(
            (await links.findOne({ where: { patientId: 1, caregiverId: 1 } }))
                .note,
        ).toBeNull();
        expect(sql).toEqual([
            'UPDATE "patient_caregiver" SET "note" = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE "patientId" = $1 AND "emergency" IS NULL -- [1,"P1"]',
        ]);
    });

    it('a condition on undefined never finds a row', async () => {
        const { result, sql } = await recorder.observe(() =>
            Patient.findOne({ where: { id: undefined } }),
        );
        expect(result ?? null).toBeNull();
        expect(sql).toEqual([
            'SELECT ... FROM "patient" "Patient" WHERE ( "Patient"."id" = $1 ) AND ( "Patient"."deletedAt" IS NULL ) LIMIT 1 -- [null]',
        ]);
    });

    describe('the guards that keep undefined away from a lookup', () => {
        it('an empty access token id is refused before any lookup', async () => {
            const { error, sql } = await recorder.observe(() =>
                module.get(AccessTokenService).validateAccessToken(''),
            );
            expect(error).toEqual(
                new AuthenticationError(
                    'Authentication error! No access token provided.',
                ),
            );
            expect(sql).toEqual([]);
        });

        it('without an informant clinician no user is looked up', async () => {
            const { error, sql } = await recorder.observe(() =>
                module.get(AssessmentService).createNewAssessment({
                    assessmentTypeId: 1,
                    patientId: 1,
                    clinicianId: 1,
                    informantType: 'PATIENT',
                    questionnaires: [],
                    questionnaireBundles: [],
                    dates: [{ deliveryDate: null, expirationDate: null }],
                    emailReminder: false,
                } as any),
            );
            expect(error).toBeUndefined();
            expect(
                sql.filter(statement => statement.includes('FROM "user"')),
            ).toEqual([]);
        });

        it('an empty medical record number is stored as NULL without a duplicate lookup', async () => {
            const { result, error, sql } = await recorder.observe(() =>
                module.get(PatientResolver).createOnePatient(
                    {
                        patient: {
                            medicalRecordNo: '',
                            firstName: 'P',
                            lastName: 'One',
                            departmentIds: [],
                        },
                    } as any,
                    { id: 1 } as User,
                ),
            );
            expect(error).toBeUndefined();
            expect(result.medicalRecordNo).toBeNull();
            expect(
                sql.filter(statement =>
                    statement.includes('"medicalRecordNo" = '),
                ),
            ).toEqual([]);
        });
    });
});
