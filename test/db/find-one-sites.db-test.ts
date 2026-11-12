import { NotFoundException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { EntityNotFoundError } from 'typeorm';
import { UpdateFullAssessmentInput } from 'src/modules/assessment/dtos/create-assessment.input';
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
import {
    conditions,
    lookupModule,
    StatementRecorder,
    whereLive,
} from './database';
import { newAssessment, newAssessmentType, newPatient, newUser } from './rows';

// The services' lookups of one row, by id or by a column, each with a value
// that exists and one that does not: the row it finds or the error it
// throws, and the lookup's statement.

const MISSING = 999999;
const DOCUMENT_ID = '63c67b43ea6e670024c8bca1';

/** The statement of `findOne({ where: { id } })` on a soft-deletable entity. */
function byId(table: string, entity: string, id: number): string {
    return `SELECT ... FROM "${table}" "${entity}" ${whereLive(
        entity,
        `"${entity}"."id" = $1`,
    )} LIMIT 1 -- [${id}]`;
}

/** The statement of `findOne({ where: { column: value } })` on an entity without soft delete. */
function byColumn(
    table: string,
    entity: string,
    column: string,
    value: string,
): string {
    return `SELECT ... FROM "${table}" "${entity}" WHERE ${conditions(
        `"${entity}"."${column}" = $1`,
    )} LIMIT 1 -- ${JSON.stringify([value])}`;
}

/**
 * The Mongo side of an assessment, stubbed: these tests are about Postgres.
 * The document carries its `_id` and the `id` virtual, as a real one does.
 */
function questionnaireAssessments(deleteAssessment = jest.fn()) {
    const document = {
        _id: new Types.ObjectId(DOCUMENT_ID),
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

describe('lookups of one row', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;
    let patient: Patient;
    let clinician: User;
    let type: AssessmentType;
    const mongo = questionnaireAssessments();

    /** The input of createNewAssessment and updateAssessment, for the patient, clinician and type above unless overridden. */
    function assessmentInput(
        overrides: Partial<UpdateFullAssessmentInput> = {},
    ): UpdateFullAssessmentInput {
        return {
            assessmentTypeId: type.id,
            patientId: patient.id,
            clinicianId: clinician.id,
            informantType: 'PATIENT',
            note: 'Invented',
            questionnaires: [],
            questionnaireBundles: [],
            dates: [{ deliveryDate: null, expirationDate: null }],
            emailReminder: false,
            ...overrides,
        } as UpdateFullAssessmentInput;
    }

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'mhira_test_find_one',
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
        patient = await newPatient();
        clinician = await newUser();
        type = await newAssessmentType();
    });

    afterAll(() => module.close());

    describe('by id', () => {
        it('updateAssessmentType finds the type, or refuses a missing one', async () => {
            const service = module.get(AssessmentTypeService);
            const found = await recorder.observe(() =>
                service.updateAssessmentType({
                    assessmentTypeId: type.id,
                    name: 'Renamed',
                    status: AssessmentTypeEnum.ACTIVE,
                }),
            );
            expect(found.error).toBeUndefined();
            expect(found.result.id).toBe(type.id);
            expect(found.sql[0]).toBe(
                byId('assessment_type', 'AssessmentType', type.id),
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
            expect(found.result.assessmentType.id).toBe(type.id);
            expect(found.sql[0]).toBe(
                byId('assessment_type', 'AssessmentType', type.id),
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
            const assessment = await newAssessment(patient);
            const found = await recorder.observe(() =>
                service.updateAssessment(
                    assessmentInput({ assessmentId: assessment.id }),
                ),
            );
            expect(found.error).toBeUndefined();
            expect(found.result.id).toBe(assessment.id);
            expect(found.result.assessmentType.id).toBe(type.id);
            expect(found.sql.slice(0, 2)).toEqual([
                byId('assessment', 'Assessment', assessment.id),
                byId('assessment_type', 'AssessmentType', type.id),
            ]);

            const noAssessment = await recorder.observe(() =>
                service.updateAssessment(
                    assessmentInput({ assessmentId: MISSING }),
                ),
            );
            expect(noAssessment.error).toBeInstanceOf(EntityNotFoundError);
            expect(noAssessment.error.message).toBe(
                `Could not find any entity of type "Assessment" matching: ${MISSING}`,
            );
            expect(noAssessment.sql).toEqual([
                byId('assessment', 'Assessment', MISSING),
            ]);

            const noType = await recorder.observe(() =>
                service.updateAssessment(
                    assessmentInput({
                        assessmentId: assessment.id,
                        assessmentTypeId: MISSING,
                    }),
                ),
            );
            expect(noType.error).toEqual(
                new NotFoundException('Assessment type not found!'),
            );
            expect(noType.sql).toEqual([
                byId('assessment', 'Assessment', assessment.id),
                byId('assessment_type', 'AssessmentType', MISSING),
            ]);
        });

        it('archiveOneAssessment finds the assessment, or refuses a missing one', async () => {
            const service = module.get(AssessmentService);
            const assessment = await newAssessment(patient);
            const found = await recorder.observe(() =>
                service.archiveOneAssessment(assessment.id),
            );
            expect(found.error).toBeUndefined();
            expect(found.result.id).toBe(assessment.id);
            await assessment.reload();
            expect(assessment.deleted).toBe(true);
            expect(found.sql[0]).toBe(
                byId('assessment', 'Assessment', assessment.id),
            );

            const missing = await recorder.observe(() =>
                service.archiveOneAssessment(MISSING),
            );
            expect(missing.error).toBeInstanceOf(EntityNotFoundError);
            expect(missing.error.message).toBe(
                `Could not find any entity of type "Assessment" matching: ${MISSING}`,
            );
            expect(missing.sql).toEqual([
                byId('assessment', 'Assessment', MISSING),
            ]);
        });

        it('getEmailTemplate finds the template, or refuses a missing one', async () => {
            const service = module.get(MailTemplateService);
            // The template the migrations create.
            const [template] = await MailTemplate.find();
            const found = await recorder.observe(() =>
                service.getEmailTemplate(template.id),
            );
            expect(found.error).toBeUndefined();
            expect(found.result.id).toBe(template.id);
            expect(found.sql).toEqual([
                byId('mail_template', 'MailTemplate', template.id),
            ]);

            const missing = await recorder.observe(() =>
                service.getEmailTemplate(MISSING),
            );
            expect(missing.error).toBeInstanceOf(EntityNotFoundError);
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
            const informant = await newUser();
            const assessment = await newAssessment(patient);
            const created = await recorder.observe(() =>
                service.createNewAssessment(
                    assessmentInput({ informantClinicianId: informant.id }),
                ),
            );
            expect(created.error).toBeUndefined();
            expect(created.result.informantClinician.id).toBe(informant.id);
            expect(created.sql[1]).toBe(byId('user', 'User', informant.id));

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
                        assessmentId: assessment.id,
                        informantClinicianId: informant.id,
                    }),
                ),
            );
            expect(updated.error).toBeUndefined();
            expect(updated.result.informantClinician.id).toBe(informant.id);
            expect(updated.sql[2]).toBe(byId('user', 'User', informant.id));

            const updateMissing = await recorder.observe(() =>
                service.updateAssessment(
                    assessmentInput({
                        assessmentId: assessment.id,
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
            // The migrations create the disclaimer `expiredText`.
            const found = await recorder.observe(() =>
                service.updateDisclaimer({
                    type: 'expiredText',
                    description: 'Invented',
                }),
            );
            expect(found.error).toBeUndefined();
            expect(
                (await Disclaimer.findOne({ where: { type: 'expiredText' } }))
                    .description,
            ).toBe('Invented');
            expect(found.sql[0]).toBe(
                byColumn('disclaimer', 'Disclaimer', 'type', 'expiredText'),
            );

            const missing = await recorder.observe(() =>
                service.updateDisclaimer({
                    type: 'noSuchText',
                    description: 'Invented',
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
