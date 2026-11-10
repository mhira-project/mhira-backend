import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { AssessmentType } from 'src/modules/assessment/models/assessment-type.model';
import { AssessmentTypeEnum } from 'src/modules/assessment/enums/assessment-type.enum';
import { AssessmentService } from 'src/modules/assessment/services/assessment.service';
import { AssessmentTypeService } from 'src/modules/assessment/services/assessment-type.service';
import { Caregiver } from 'src/modules/caregiver/models/caregiver.model';
import { Disclaimer } from 'src/modules/disclaimer/models/disclaimer.model';
import { DisclaimerService } from 'src/modules/disclaimer/providers/disclaimer.service';
import { MailTemplate } from 'src/modules/mail/models/mail-template.model';
import { MailTemplateService } from 'src/modules/mail/services/mail-template.service';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';
import { Patient } from 'src/modules/patient/models/patient.model';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { Setting } from 'src/modules/setting/models/setting.model';
import { SettingService } from 'src/modules/setting/providers/setting.service';
import { User } from 'src/modules/user/models/user.model';
import { lookupModule, StatementRecorder } from './database';

// Ticket 07, 07_D, P1 (T2): the `findOne` and `findOneOrFail` calls TypeORM
// 0.3 no longer accepts in their 0.2 forms (an id, or a conditions object
// without `where`), each with an existing and a missing value: the row it
// finds or the error it throws, and the lookup's statement. The ids come
// from `Int!` arguments and the conditions from required arguments or
// constants, so `undefined` does not reach them (research, section 8).

const MISSING = 999999;
const DOCUMENT_ID = '63c67b43ea6e670024c8bca1';

/**
 * The statement of a lookup by id on a soft-deletable entity, in the form
 * P2 writes it, `findOne({ where: { id } })`. v1.1.6's `findOne(id)` and
 * `findOneOrFail(id)` sent `WHERE ( "X"."id" IN ($1) )` without a LIMIT:
 * the same row, and for an `Int!` id no error that could carry the SQL.
 */
function byId(table: string, entity: string, id: number): string {
    return `SELECT ... FROM "${table}" "${entity}" WHERE ( "${entity}"."id" = $1 ) AND ( "${entity}"."deletedAt" IS NULL ) LIMIT 1 -- [${id}]`;
}

/** TypeORM 0.2's statement for `findOne({ column: value })` on an entity without soft delete. */
function byColumn(
    table: string,
    entity: string,
    column: string,
    value: string,
): string {
    return `SELECT ... FROM "${table}" "${entity}" WHERE "${entity}"."${column}" = $1 LIMIT 1 -- ${JSON.stringify(
        [value],
    )}`;
}

/** The Mongo side of an assessment, stubbed: these tests are about Postgres. */
function questionnaireAssessments(deleteAssessment = jest.fn()) {
    const document = {
        id: DOCUMENT_ID,
        questionnaires: [],
        deleteOne: jest.fn(),
    };
    return {
        createNewAssessment: jest.fn().mockResolvedValue(document),
        changeAssessmentStatus: jest.fn(),
        getById: jest.fn().mockResolvedValue(document),
        updateAssessment: jest.fn().mockResolvedValue(document),
        deleteAssessment,
    };
}

function assessmentInput(overrides: Record<string, unknown> = {}) {
    return {
        assessmentTypeId: 1,
        patientId: 1,
        clinicianId: 1,
        mailTemplateId: null,
        informantType: 'PATIENT',
        note: 'P1',
        questionnaires: [],
        questionnaireBundles: [],
        dates: [{ deliveryDate: null, expirationDate: null }],
        emailReminder: false,
        receiverEmail: null,
        ...overrides,
    } as any;
}

describe('findOne and findOneOrFail (P1, T2)', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;
    const mongo = questionnaireAssessments();

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'lookups_find_one',
            [
                Assessment,
                AssessmentType,
                Caregiver,
                MailTemplate,
                Patient,
                User,
            ],
            [
                AssessmentService,
                AssessmentTypeService,
                DisclaimerService,
                MailTemplateService,
                SettingService,
                { provide: QuestionnaireAssessmentService, useValue: mongo },
                { provide: PatientQueryService, useValue: {} },
            ],
        ));
    });

    afterAll(() => module.close());

    describe('by id', () => {
        it('updateAssessmentType finds the type, or refuses a missing one', async () => {
            const service = module.get(AssessmentTypeService);
            const found = await recorder.observe(() =>
                service.updateAssessmentType({
                    assessmentTypeId: 2,
                    name: 't0',
                    status: AssessmentTypeEnum.ACTIVE,
                }),
            );
            expect(found.error).toBeUndefined();
            expect(found.result.id).toBe(2);
            expect(found.sql[0]).toBe(
                byId('assessment_type', 'AssessmentType', 2),
            );

            const missing = await recorder.observe(() =>
                service.updateAssessmentType({
                    assessmentTypeId: MISSING,
                    name: 'x',
                    status: AssessmentTypeEnum.ACTIVE,
                }),
            );
            expect(missing.error).toEqual(
                new NotFoundException('Assessment type not found!'),
            );
            expect(missing.sql).toEqual([
                byId('assessment_type', 'AssessmentType', MISSING),
            ]);
        });

        it('createNewAssessment finds the assessment type, or refuses a missing one', async () => {
            const service = module.get(AssessmentService);
            const found = await recorder.observe(() =>
                service.createNewAssessment(assessmentInput()),
            );
            expect(found.error).toBeUndefined();
            expect(found.result.assessmentType.id).toBe(1);
            expect(found.sql[0]).toBe(
                byId('assessment_type', 'AssessmentType', 1),
            );

            const missing = await recorder.observe(() =>
                service.createNewAssessment(
                    assessmentInput({ assessmentTypeId: MISSING }),
                ),
            );
            expect(missing.error).toEqual(
                new NotFoundException('Assessment type not found!'),
            );
            expect(missing.sql).toEqual([
                byId('assessment_type', 'AssessmentType', MISSING),
            ]);
        });

        it('updateAssessment finds the assessment and its type, or refuses either missing', async () => {
            const service = module.get(AssessmentService);
            const found = await recorder.observe(() =>
                service.updateAssessment(
                    assessmentInput({ assessmentId: 3, assessmentTypeId: 2 }),
                ),
            );
            expect(found.error).toBeUndefined();
            expect(found.result.id).toBe(3);
            expect(found.result.assessmentType.id).toBe(2);
            expect(found.sql.slice(0, 2)).toEqual([
                byId('assessment', 'Assessment', 3),
                byId('assessment_type', 'AssessmentType', 2),
            ]);

            const noAssessment = await recorder.observe(() =>
                service.updateAssessment(
                    assessmentInput({ assessmentId: MISSING }),
                ),
            );
            expect(noAssessment.error.name).toBe('EntityNotFound');
            expect(noAssessment.error.message).toBe(
                `Could not find any entity of type "Assessment" matching: ${MISSING}`,
            );
            expect(noAssessment.sql).toEqual([
                byId('assessment', 'Assessment', MISSING),
            ]);

            const noType = await recorder.observe(() =>
                service.updateAssessment(
                    assessmentInput({
                        assessmentId: 3,
                        assessmentTypeId: MISSING,
                    }),
                ),
            );
            expect(noType.error).toEqual(
                new NotFoundException('Assessment type not found!'),
            );
            expect(noType.sql).toEqual([
                byId('assessment', 'Assessment', 3),
                byId('assessment_type', 'AssessmentType', MISSING),
            ]);
        });

        it('archiveOneAssessment finds the assessment, or refuses a missing one', async () => {
            const service = module.get(AssessmentService);
            const found = await recorder.observe(() =>
                service.archiveOneAssessment(4),
            );
            expect(found.error).toBeUndefined();
            expect(found.result.id).toBe(4);
            const assessments = module.get<Repository<Assessment>>(
                getRepositoryToken(Assessment),
            );
            expect(
                (await assessments.findOne({ where: { id: 4 } })).deleted,
            ).toBe(true);
            expect(found.sql[0]).toBe(byId('assessment', 'Assessment', 4));

            const missing = await recorder.observe(() =>
                service.archiveOneAssessment(MISSING),
            );
            expect(missing.error.name).toBe('EntityNotFound');
            expect(missing.error.message).toBe(
                `Could not find any entity of type "Assessment" matching: ${MISSING}`,
            );
            expect(missing.sql).toEqual([
                byId('assessment', 'Assessment', MISSING),
            ]);
        });

        it('getEmailTemplate finds the template, or refuses a missing one', async () => {
            const service = module.get(MailTemplateService);
            const found = await recorder.observe(() =>
                service.getEmailTemplate(2),
            );
            expect(found.error).toBeUndefined();
            expect(found.result.id).toBe(2);
            expect(found.sql).toEqual([
                byId('mail_template', 'MailTemplate', 2),
            ]);

            const missing = await recorder.observe(() =>
                service.getEmailTemplate(MISSING),
            );
            expect(missing.error.name).toBe('EntityNotFound');
            expect(missing.error.message).toBe(
                `Could not find any entity of type "MailTemplate" matching: ${MISSING}`,
            );
            expect(missing.sql).toEqual([
                byId('mail_template', 'MailTemplate', MISSING),
            ]);
        });
    });

    describe('by conditions', () => {
        it('createNewAssessment and updateAssessment find the informant clinician, or refuse a missing one', async () => {
            const service = module.get(AssessmentService);
            const created = await recorder.observe(() =>
                service.createNewAssessment(
                    assessmentInput({ informantClinicianId: 2 }),
                ),
            );
            expect(created.error).toBeUndefined();
            expect(created.result.informantClinician.id).toBe(2);
            expect(created.sql[1]).toBe(byId('user', 'User', 2));

            const createMissing = await recorder.observe(() =>
                service.createNewAssessment(
                    assessmentInput({ informantClinicianId: MISSING }),
                ),
            );
            expect(createMissing.error).toEqual(
                new NotFoundException('Informant clinician not found!'),
            );
            expect(createMissing.sql[1]).toBe(byId('user', 'User', MISSING));

            const updated = await recorder.observe(() =>
                service.updateAssessment(
                    assessmentInput({
                        assessmentId: 3,
                        informantClinicianId: 3,
                    }),
                ),
            );
            expect(updated.error).toBeUndefined();
            expect(updated.result.informantClinician.id).toBe(3);
            expect(updated.sql[2]).toBe(byId('user', 'User', 3));

            const updateMissing = await recorder.observe(() =>
                service.updateAssessment(
                    assessmentInput({
                        assessmentId: 3,
                        informantClinicianId: MISSING,
                    }),
                ),
            );
            expect(updateMissing.error).toEqual(
                new NotFoundException('Informant clinician not found!'),
            );
            expect(updateMissing.sql[2]).toBe(byId('user', 'User', MISSING));
        });

        it('updateDisclaimer finds the disclaimer by type, or refuses a missing one', async () => {
            const service = module.get(DisclaimerService);
            const found = await recorder.observe(() =>
                service.updateDisclaimer({
                    type: 'expiredText',
                    description: 'P1',
                }),
            );
            expect(found.error).toBeUndefined();
            expect(
                (await Disclaimer.findOne({ where: { type: 'expiredText' } }))
                    .description,
            ).toBe('P1');
            expect(found.sql[0]).toBe(
                byColumn('disclaimer', 'Disclaimer', 'type', 'expiredText'),
            );

            const missing = await recorder.observe(() =>
                service.updateDisclaimer({
                    type: 'noSuchText',
                    description: 'P1',
                }),
            );
            expect(missing.error).toEqual(
                new NotFoundException('Disclaimer type not found!'),
            );
            expect(missing.sql).toEqual([
                byColumn('disclaimer', 'Disclaimer', 'type', 'noSuchText'),
            ]);
        });

        it('updateKey and getKey find a setting by key, or fall back to the default', async () => {
            const service = module.get(SettingService);
            const before = await recorder.observe(() =>
                service.getKey('maxLoginAttempts'),
            );
            expect(before.result).toBe(5);
            expect(before.sql).toEqual([
                byColumn('setting', 'Setting', 'key', 'maxLoginAttempts'),
            ]);

            const created = await recorder.observe(() =>
                service.updateKey('maxLoginAttempts', 7),
            );
            expect(created.error).toBeUndefined();
            expect(created.sql[0]).toBe(
                byColumn('setting', 'Setting', 'key', 'maxLoginAttempts'),
            );

            const after = await recorder.observe(() =>
                service.getKey('maxLoginAttempts'),
            );
            expect(after.result).toBe('7');
            expect(after.sql).toEqual([
                byColumn('setting', 'Setting', 'key', 'maxLoginAttempts'),
            ]);
            expect(await Setting.count()).toBe(1);
        });
    });
});
