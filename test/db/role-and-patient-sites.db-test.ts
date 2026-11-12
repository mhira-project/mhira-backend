import { BadRequestException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Patient } from 'src/modules/patient/models/patient.model';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';
import { PatientStatusService } from 'src/modules/patient/providers/patient-status.service';
import {
    CreateOnePatientInput,
    PatientResolver,
} from 'src/modules/patient/resolvers/patient.resolver';
import { CreateOneRoleInput } from 'src/modules/permission/dtos/create-one-role.input';
import { RoleCode } from 'src/modules/permission/enums/role-code.enum';
import { Role } from 'src/modules/permission/models/role.model';
import { PermissionService } from 'src/modules/permission/providers/permission.service';
import { RoleCrudService } from 'src/modules/permission/providers/role-crud.service';
import { RoleResolver } from 'src/modules/permission/resolvers/role.resolver';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { QuestionnaireScriptService } from 'src/modules/questionnaire/services/questionnaire-script.service';
import { User } from 'src/modules/user/models/user.model';
import { UserCrudService } from 'src/modules/user/providers/user-crud.service';
import { lookupModule, StatementRecorder, whereLive } from './database';
import { newPatient, newRole } from './rows';

// The lookups of one row by a column on roles and patients, with a value
// that exists and one that does not: the role codes the backend creates on
// its first start and gives new users, a role's name, and a new patient's
// medical record number.

/** The statement of `findOne({ where: { column: value } })` on a soft-deletable entity. */
function byColumn(
    table: string,
    entity: string,
    column: string,
    value: string,
): string {
    return `SELECT ... FROM "${table}" "${entity}" ${whereLive(
        entity,
        `"${entity}"."${column}" = $1`,
    )} LIMIT 1 -- ${JSON.stringify([value])}`;
}

describe('lookups by a column, roles and patients', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;
    let superAdmin: User;

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'mhira_test_roles',
            [Patient, Role, User],
            [
                PermissionService,
                RoleCrudService,
                UserCrudService,
                PatientQueryService,
                PatientResolver,
                { provide: PatientStatusService, useValue: {} },
                { provide: QuestionnaireAssessmentService, useValue: {} },
                { provide: QuestionnaireScriptService, useValue: {} },
            ],
        ));
        // What the backend does on its first start: it creates the two
        // system roles and a super admin.
        await module.get(PermissionService).onModuleInit();
        superAdmin = await User.findOneOrFail({ where: { isSuperUser: true } });
    });

    afterAll(() => module.close());

    it('a later start finds both system roles, and creates one that is missing', async () => {
        const seeding = module.get(PermissionService);
        const present = await recorder.observe(() => seeding.onModuleInit());
        expect(present.error).toBeUndefined();
        expect(present.sql).toContain(
            byColumn('role', 'Role', 'code', RoleCode.SUPER_ADMIN),
        );
        expect(present.sql).toContain(
            byColumn('role', 'Role', 'code', RoleCode.NO_ROLE),
        );
        expect(
            present.sql.filter(statement =>
                statement.startsWith('INSERT INTO "role"'),
            ),
        ).toEqual([]);

        await Role.update({ code: RoleCode.NO_ROLE }, { code: null });
        const missing = await recorder.observe(() => seeding.onModuleInit());
        expect(missing.error).toBeUndefined();
        expect(missing.sql).toContain(
            byColumn('role', 'Role', 'code', RoleCode.NO_ROLE),
        );
        expect(
            missing.sql.filter(statement =>
                statement.startsWith('INSERT INTO "role"'),
            ),
        ).toHaveLength(1);
        expect(await Role.count({ where: { code: RoleCode.NO_ROLE } })).toBe(1);
    });

    it('createOneUser gives the new user the default role it finds by code', async () => {
        const users = module.get(UserCrudService);
        const { result, error, sql } = await recorder.observe(() =>
            users.createOne({
                username: 'new.user',
                password: 'An invented passw0rd!',
                active: true,
                firstName: 'Sam',
                lastName: 'New',
            }),
        );
        expect(error).toBeUndefined();
        expect(sql).toContain(
            byColumn('role', 'Role', 'code', RoleCode.NO_ROLE),
        );
        const stored = await User.findOne({
            where: { id: result.id },
            relations: ['roles'],
        });
        expect(stored.roles.map(role => role.code)).toEqual([RoleCode.NO_ROLE]);
    });

    it('createOneRole refuses a name that exists, and goes on with a new one', async () => {
        // Constructed as Nest would, without the authorizer the generated
        // resolver methods use: createOneRole is written by hand and has none.
        const roles = new RoleResolver(module.get(RoleCrudService));
        await newRole({ name: 'Clinician' });
        const taken = await recorder.observe(() =>
            roles.createOneRole(
                ({
                    role: { name: 'Clinician', hierarchy: 99 },
                } as unknown) as CreateOneRoleInput,
                superAdmin,
            ),
        );
        expect(taken.error).toEqual(
            new BadRequestException('Role with same name already exists'),
        );
        expect(taken.sql).toEqual([
            byColumn('role', 'Role', 'name', 'Clinician'),
        ]);

        const free = await recorder.observe(() =>
            roles.createOneRole(
                ({
                    role: { name: 'Nurse', hierarchy: 99 },
                } as unknown) as CreateOneRoleInput,
                superAdmin,
            ),
        );
        expect(free.error).toBeUndefined();
        expect(free.result.name).toBe('Nurse');
        expect(free.sql[0]).toBe(byColumn('role', 'Role', 'name', 'Nurse'));
    });

    it('createOnePatient refuses a medical record number that exists, and goes on with a new one', async () => {
        const patients = module.get(PatientResolver);
        // The resolver reads the input under its GraphQL name, `patient`.
        const patient = (medicalRecordNo: string) =>
            (({
                patient: {
                    medicalRecordNo,
                    firstName: 'Alex',
                    lastName: 'New',
                    departmentIds: [],
                },
            } as unknown) as CreateOnePatientInput);
        await newPatient({ medicalRecordNo: 'MRN-1' });

        const taken = await recorder.observe(() =>
            patients.createOnePatient(patient('MRN-1'), superAdmin),
        );
        expect(taken.error).toEqual(
            new BadRequestException(
                'Patient with same Medical Record No. already exists',
            ),
        );
        expect(taken.sql).toContain(
            byColumn('patient', 'Patient', 'medicalRecordNo', 'MRN-1'),
        );

        const free = await recorder.observe(() =>
            patients.createOnePatient(patient('MRN-2'), superAdmin),
        );
        expect(free.error).toBeUndefined();
        expect(free.result.medicalRecordNo).toBe('MRN-2');
        expect(free.sql).toContain(
            byColumn('patient', 'Patient', 'medicalRecordNo', 'MRN-2'),
        );
    });
});
