import { BadRequestException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Patient } from 'src/modules/patient/models/patient.model';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';
import { PatientStatusService } from 'src/modules/patient/providers/patient-status.service';
import { PatientResolver } from 'src/modules/patient/resolvers/patient.resolver';
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

// Ticket 07, 07_D, P1 (T2): the `findOne({ field })` calls on roles and
// patients, with a value that exists and one that does not: the role codes
// the backend seeds and gives new users, a role's name, and a new patient's
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

const SUPER_ADMIN = { id: 1 } as User;

describe('findOne by a column, roles and patients (P1, T2)', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'lookups_roles',
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
    });

    afterAll(() => module.close());

    it('the permission seeding finds both system roles, and creates one that is missing', async () => {
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
                username: 'p1-lookup-user',
                password: 'P1-lookup-pass!',
                active: true,
                firstName: 'P',
                lastName: 'One',
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
        const taken = await recorder.observe(() =>
            roles.createOneRole(
                { role: { name: 'Admin', hierarchy: 99 } } as any,
                SUPER_ADMIN,
            ),
        );
        expect(taken.error).toEqual(
            new BadRequestException('Role with same name already exists'),
        );
        expect(taken.sql).toEqual([byColumn('role', 'Role', 'name', 'Admin')]);

        const free = await recorder.observe(() =>
            roles.createOneRole(
                { role: { name: 'P1 role', hierarchy: 99 } } as any,
                SUPER_ADMIN,
            ),
        );
        expect(free.error).toBeUndefined();
        expect(free.result.name).toBe('P1 role');
        expect(free.sql[0]).toBe(byColumn('role', 'Role', 'name', 'P1 role'));
    });

    it('createOnePatient refuses a medical record number that exists, and goes on with a new one', async () => {
        const patients = module.get(PatientResolver);
        const patient = (medicalRecordNo: string) =>
            ({
                patient: {
                    medicalRecordNo,
                    firstName: 'P',
                    lastName: 'One',
                    departmentIds: [],
                },
            } as any);

        const taken = await recorder.observe(() =>
            patients.createOnePatient(patient('MRN-00150'), SUPER_ADMIN),
        );
        expect(taken.error).toEqual(
            new BadRequestException(
                'Patient with same Medical Record No. already exists',
            ),
        );
        expect(taken.sql).toContain(
            byColumn('patient', 'Patient', 'medicalRecordNo', 'MRN-00150'),
        );

        const free = await recorder.observe(() =>
            patients.createOnePatient(patient('P1-LOOKUP-1'), SUPER_ADMIN),
        );
        expect(free.error).toBeUndefined();
        expect(free.result.medicalRecordNo).toBe('P1-LOOKUP-1');
        expect(free.sql).toContain(
            byColumn('patient', 'Patient', 'medicalRecordNo', 'P1-LOOKUP-1'),
        );
    });
});
