import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TestingModule } from '@nestjs/testing';
import { AuthenticationError } from 'src/shared/exception/graphql-errors';
import { CreateFullAssessmentInput } from 'src/modules/assessment/dtos/create-assessment.input';
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
import {
    CreateOnePatientInput,
    PatientResolver,
} from 'src/modules/patient/resolvers/patient.resolver';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { QuestionnaireScriptService } from 'src/modules/questionnaire/services/questionnaire-script.service';
import { User } from 'src/modules/user/models/user.model';
import { CacheService } from 'src/shared';
import { lookupModule, StatementRecorder, whereLive } from './database';
import {
    newAssessmentType,
    newCaregiver,
    newPatient,
    newPatientCaregiver,
    newUser,
} from './rows';

// `null` and `undefined` in the conditions of a lookup. The backend has
// TypeORM compare a `null` value with `IS NULL` and throw on `undefined`
// (TYPEORM_WHERE_VALUES in config.service.ts); TypeORM's own default drops
// both conditions, and a lookup would then return the first row it finds.
// The backend's guards keep `undefined` away from the lookups that could
// see it.

/** The caregiver insert's WHERE clause: the patient and caregiver of the link, then `more`. */
function link(...more: string[]): string {
    return whereLive(
        'PatientCaregiver',
        '"PatientCaregiver"."patientId" = $1',
        '"PatientCaregiver"."caregiverId" = $2',
        ...more,
    );
}

// The Mongo side of a new assessment, stubbed: these tests are about Postgres.
const DOCUMENT = {
    id: '0123456789abcdef01234567',
    questionnaires: [],
    deleteOne: jest.fn(),
};

describe('null and undefined in conditions', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;
    let patient: Patient;
    let caregiver: Caregiver;

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'mhira_test_null',
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

    beforeEach(async () => {
        patient = await newPatient();
        caregiver = await newCaregiver();
    });

    afterAll(() => module.close());

    describe("the caregiver insert's existence check spreads the input into its conditions", () => {
        it('a value is compared with =, and an existing link is refused', async () => {
            await newPatientCaregiver(patient, caregiver, {
                relation: 'Mother',
            });
            const { error, sql } = await recorder.observe(() =>
                module.get(PatientCaregiverService).insert({
                    patientId: patient.id,
                    caregiverId: caregiver.id,
                    relation: 'Mother',
                }),
            );
            expect(error).toEqual(new ConflictException());
            expect(sql).toEqual([
                `SELECT ... FROM "patient_caregiver" "PatientCaregiver" ${link(
                    '"PatientCaregiver"."relation" = $3',
                )} LIMIT 1 -- [${patient.id},${caregiver.id},"Mother"]`,
            ]);
        });

        it('null is IS NULL: it finds the link whose column is NULL, which is then refused', async () => {
            await newPatientCaregiver(patient, caregiver, {
                emergency: null,
                note: null,
            });
            const { error, sql } = await recorder.observe(() =>
                module.get(PatientCaregiverService).insert({
                    patientId: patient.id,
                    caregiverId: caregiver.id,
                    emergency: null,
                    note: null,
                }),
            );
            expect(error).toEqual(new ConflictException());
            expect(sql).toEqual([
                `SELECT ... FROM "patient_caregiver" "PatientCaregiver" ${link(
                    '"PatientCaregiver"."emergency" IS NULL',
                    '"PatientCaregiver"."note" IS NULL',
                )} LIMIT 1 -- [${patient.id},${caregiver.id}]`,
            ]);
        });

        it('null is IS NULL: it does not find a link whose column has a value, so the insert goes ahead and the unique pair refuses it', async () => {
            await newPatientCaregiver(patient, caregiver, {
                relation: 'Mother',
            });
            const { error, sql } = await recorder.observe(() =>
                module.get(PatientCaregiverService).insert({
                    patientId: patient.id,
                    caregiverId: caregiver.id,
                    relation: null,
                }),
            );
            // Were null dropped from the conditions, the existing link
            // would be found and refused as a conflict instead.
            expect(error.name).toBe('QueryFailedError');
            expect(error.message).toBe(
                'duplicate key value violates unique constraint "UQ_d1984b08df9e3fba76965be4aa3"',
            );
            expect(sql[0]).toBe(
                `SELECT ... FROM "patient_caregiver" "PatientCaregiver" ${link(
                    '"PatientCaregiver"."relation" IS NULL',
                )} LIMIT 1 -- [${patient.id},${caregiver.id}]`,
            );
            expect(
                await PatientCaregiver.count({
                    where: { patientId: patient.id, caregiverId: caregiver.id },
                }),
            ).toBe(1);
        });
    });

    it('update with a null condition is IS NULL and changes exactly the rows whose column is NULL', async () => {
        const withNull = await newPatientCaregiver(patient, caregiver, {
            emergency: null,
        });
        const withValue = await newPatientCaregiver(
            patient,
            await newCaregiver(),
            { emergency: false },
        );

        const { result, error, sql } = await recorder.observe(() =>
            PatientCaregiver.update(
                { patientId: patient.id, emergency: null },
                { note: 'Changed' },
            ),
        );

        expect(error).toBeUndefined();
        expect(result.affected).toBe(1);
        await withNull.reload();
        await withValue.reload();
        expect(withNull.note).toBe('Changed');
        expect(withValue.note).toBeNull();
        expect(sql).toEqual([
            `UPDATE "patient_caregiver" SET "note" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE ("patientId" = $2 AND "emergency" IS NULL) -- ["Changed",${patient.id}]`,
        ]);
    });

    it('a condition on undefined throws, and never finds a row', async () => {
        const { result, error, sql } = await recorder.observe(() =>
            Patient.findOne({ where: { id: undefined } }),
        );
        expect(result).toBeUndefined();
        expect(error.message).toBe(
            "Undefined value encountered in property 'Patient.id' of a where condition. Set 'invalidWhereValuesBehavior.undefined' to 'ignore' in connection options to skip properties with undefined values.",
        );
        expect(sql).toEqual([]);
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
            const type = await newAssessmentType();
            const clinician = await newUser();
            const { error, sql } = await recorder.observe(() =>
                module.get(AssessmentService).createNewAssessment({
                    assessmentTypeId: type.id,
                    patientId: patient.id,
                    clinicianId: clinician.id,
                    informantType: 'PATIENT',
                    questionnaires: [],
                    questionnaireBundles: [],
                    dates: [{ deliveryDate: null, expirationDate: null }],
                    emailReminder: false,
                } as CreateFullAssessmentInput),
            );
            expect(error).toBeUndefined();
            expect(
                sql.filter(statement => statement.includes('FROM "user"')),
            ).toEqual([]);
        });

        it('an empty medical record number is stored as NULL without a duplicate lookup', async () => {
            const currentUser = await newUser();
            const { result, error, sql } = await recorder.observe(() =>
                module.get(PatientResolver).createOnePatient(
                    ({
                        patient: {
                            medicalRecordNo: '',
                            firstName: 'P',
                            lastName: 'One',
                            departmentIds: [],
                        },
                    } as unknown) as CreateOnePatientInput,
                    currentUser,
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
