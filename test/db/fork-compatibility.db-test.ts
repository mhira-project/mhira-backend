import { TestingModule } from '@nestjs/testing';
import {
    Class,
    InjectQueryService,
    QueryService,
} from '@ptc-org/nestjs-query-core';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { Patient } from 'src/modules/patient/models/patient.model';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';
import { PatientStatusService } from 'src/modules/patient/providers/patient-status.service';
import { PatientResolver } from 'src/modules/patient/resolvers/patient.resolver';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { QuestionnaireScriptService } from 'src/modules/questionnaire/services/questionnaire-script.service';
import { Report } from 'src/modules/report/models/report.model';
import { restoreBooleanComparisons } from 'src/shared/boolean-comparisons';
import { Department } from 'src/modules/department/models/department.model';
import { Role } from 'src/modules/permission/models/role.model';
import { User } from 'src/modules/user/models/user.model';
import { UserCrudService } from 'src/modules/user/providers/user-crud.service';
import { lookupModule, StatementRecorder } from './database';
import {
    newAssessment,
    newDepartment,
    newPatient,
    newReport,
    newRole,
    newUser,
} from './rows';

// Behaviours of the resolver library (@ptc-org/nestjs-query) that the
// backend relies on or corrects: relations loaded for several records at
// once, and the `is` and `isNot` filters (src/shared/boolean-comparisons.ts).

class Reports {
    constructor(
        @InjectQueryService(Report) readonly service: QueryService<Report>,
    ) {}
}

describe('the resolver library', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;

    beforeAll(async () => {
        restoreBooleanComparisons();
        ({ module, recorder } = await lookupModule(
            'mhira_test_resolver_library',
            [Assessment, Department, Patient, Report, Role, User],
            [
                PatientQueryService,
                PatientResolver,
                Reports,
                UserCrudService,
                { provide: PatientStatusService, useValue: {} },
                { provide: QuestionnaireAssessmentService, useValue: {} },
                { provide: QuestionnaireScriptService, useValue: {} },
            ],
        ));
    });

    afterAll(() => module.close());

    it('Patient.assessments gives each patient one of its own assessments', async () => {
        const resolver = module.get(PatientResolver);
        const patients = [
            await newPatient(),
            await newPatient(),
            await newPatient(),
        ];
        for (const patient of patients) {
            await newAssessment(patient);
            await newAssessment(patient);
        }

        for (const patient of patients) {
            const { result, error } = await recorder.observe(() =>
                resolver.assessments(patient),
            );
            expect(error).toBeUndefined();
            expect(result.patientId).toBe(patient.id);
        }
    });

    it("relations loaded for several records at once go to each record (users' roles and departments)", async () => {
        const [nurse, clinician] = [await newRole(), await newRole()];
        const [north, south] = [await newDepartment(), await newDepartment()];
        const users = [
            await newUser({ roles: [nurse], departments: [north, south] }),
            await newUser({ roles: [nurse, clinician], departments: [south] }),
            await newUser(),
        ];
        const service = module.get(UserCrudService);

        async function idsByUser<Relation extends { id: number }>(
            RelationClass: Class<Relation>,
            relation: string,
        ): Promise<number[][]> {
            const batched = await service.queryRelations(
                RelationClass,
                relation,
                users,
                {},
            );
            return users.map(user =>
                batched
                    .get(user)
                    .map(found => found.id)
                    .sort(),
            );
        }

        expect(await idsByUser(Role, 'roles')).toEqual([
            [nurse.id],
            [nurse.id, clinician.id],
            [],
        ]);
        expect(await idsByUser(Department, 'departments')).toEqual([
            [north.id, south.id],
            [south.id],
            [],
        ]);
    });

    it('isNot: true keeps the rows whose column is NULL', async () => {
        await newReport({ status: true });
        const withNull = await newReport({ status: null });
        const withFalse = await newReport({ status: false });

        const { result, sql } = await recorder.observe(() =>
            module
                .get(Reports)
                .service.query({ filter: { status: { isNot: true } } }),
        );
        expect(result.map(report => report.id).sort()).toEqual([
            withNull.id,
            withFalse.id,
        ]);
        expect(sql[0]).toContain('"Report"."status" IS NOT TRUE');
    });
});
