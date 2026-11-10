import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { Repository } from 'typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { Patient } from 'src/modules/patient/models/patient.model';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';
import { PatientStatusService } from 'src/modules/patient/providers/patient-status.service';
import { PatientResolver } from 'src/modules/patient/resolvers/patient.resolver';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { QuestionnaireScriptService } from 'src/modules/questionnaire/services/questionnaire-script.service';
import { Report } from 'src/modules/report/models/report.model';
import { restoreBooleanComparisons } from 'src/shared/boolean-comparisons';
import { lookupModule, StatementRecorder } from './database';

// Ticket 07, step 11: two behaviours of the generated resolvers that the
// fork 2.0 would change and the backend keeps as v1.1.6 has them.

class Reports {
    constructor(
        @InjectQueryService(Report) readonly service: QueryService<Report>,
    ) {}
}

describe('the fork 2.0, kept as v1.1.6 (step 11)', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;

    beforeAll(async () => {
        restoreBooleanComparisons();
        ({ module, recorder } = await lookupModule(
            'lookups_fork',
            [Assessment, Patient, Report],
            [
                PatientQueryService,
                PatientResolver,
                Reports,
                { provide: PatientStatusService, useValue: {} },
                { provide: QuestionnaireAssessmentService, useValue: {} },
                { provide: QuestionnaireScriptService, useValue: {} },
            ],
        ));
    });

    afterAll(() => module.close());

    it('Patient.assessments gives each patient one of its own assessments', async () => {
        const patients = module.get<Repository<Patient>>(
            getRepositoryToken(Patient),
        );
        const resolver = module.get(PatientResolver);
        // Patients 1, 4 and 8 have 8, 3 and 7 assessments in the seed.
        for (const id of [1, 4, 8]) {
            const patient = await patients.findOne({ where: { id } });
            const { result, error } = await recorder.observe(() =>
                resolver.assessments(patient),
            );
            expect(error).toBeUndefined();
            expect(result.patientId).toBe(id);
        }
    });

    it('isNot: true keeps the rows whose column is NULL', async () => {
        const reports = module.get<Repository<Report>>(
            getRepositoryToken(Report),
        );
        await reports.update({ id: 2 }, { status: null });
        await reports.update({ id: 3 }, { status: false });

        const { result, sql } = await recorder.observe(() =>
            module
                .get(Reports)
                .service.query({ filter: { status: { isNot: true } } }),
        );
        expect(result.map(report => report.id).sort()).toEqual([2, 3]);
        expect(sql[0]).toContain('"Report"."status" IS NOT TRUE');
    });
});
