import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentTypeEnum } from 'src/modules/assessment/enums/assessment-type.enum';
import { AssessmentType } from 'src/modules/assessment/models/assessment-type.model';
import { AssessmentTypeService } from 'src/modules/assessment/services/assessment-type.service';
import { Role } from 'src/modules/permission/models/role.model';
import { Questionnaire } from 'src/modules/questionnaire/models/questionnaire.schema';
import { QuestionnaireScript } from 'src/modules/questionnaire/models/questionnaire-script.model';
import { QuestionnaireScriptService } from 'src/modules/questionnaire/services/questionnaire-script.service';
import { Report } from 'src/modules/report/models/report.model';
import { ReportService } from 'src/modules/report/services/report.service';
import { lookupModule, StatementRecorder } from './database';

// Ticket 07, 07_D, P1 (T2): the five `find` calls TypeORM 0.2 filters by
// their conditions shorthand, `find({ field })`, which 0.3 would run
// unfiltered. Each runs against data that has rows it must not return; the
// rows it returns or stores and the lookup's statement are pinned. P2
// rewrites the calls as `find({ where: { field } })`; 0.2 sends the same
// statements for both.

describe('find with conditions (P1, T2)', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'lookups_find',
            [AssessmentType, QuestionnaireScript, Report, Role],
            [
                AssessmentTypeService,
                QuestionnaireScriptService,
                ReportService,
                { provide: getModelToken(Questionnaire.name), useValue: {} },
            ],
        ));
    });

    afterAll(() => module.close());

    it('getActiveAssessmentTypes leaves out an inactive type', async () => {
        const types = module.get<Repository<AssessmentType>>(
            getRepositoryToken(AssessmentType),
        );
        const inactive = await types.save(
            types.create({
                name: 'Inactive type',
                status: AssessmentTypeEnum.INACTIVE,
            }),
        );

        const { result, error, sql } = await recorder.observe(() =>
            module.get(AssessmentTypeService).getActiveAssessmentTypes(),
        );

        expect(error).toBeUndefined();
        expect(result.map(type => type.id).sort()).toEqual([1, 2]);
        expect(result.map(type => type.id)).not.toContain(inactive.id);
        expect(sql).toEqual([
            'SELECT ... FROM "assessment_type" "AssessmentType" WHERE ( "AssessmentType"."status" = $1 ) AND ( "AssessmentType"."deletedAt" IS NULL ) -- ["ACTIVE"]',
        ]);
    });

    it("getQuestionnaireScriptsById returns only that questionnaire's live scripts", async () => {
        const questionnaireId = '66e7dbe00d4e4a002309bb6b';
        const scripts = module.get<Repository<QuestionnaireScript>>(
            getRepositoryToken(QuestionnaireScript),
        );
        const live: {
            id: number;
        }[] = await scripts.query(
            'SELECT id FROM questionnaire_script WHERE "questionnaireId" = $1 AND "deletedAt" IS NULL ORDER BY id',
            [questionnaireId],
        );

        const { result, error, sql } = await recorder.observe(() =>
            module
                .get(QuestionnaireScriptService)
                .getQuestionnaireScriptsById(questionnaireId),
        );

        expect(error).toBeUndefined();
        expect(live).toHaveLength(2);
        expect(result.map(script => script.id).sort((a, b) => a - b)).toEqual(
            live.map(row => row.id),
        );
        expect(sql).toEqual([
            'SELECT ... FROM "questionnaire_script" "QuestionnaireScript" WHERE ( "QuestionnaireScript"."questionnaireId" = $1 ) AND ( "QuestionnaireScript"."deletedAt" IS NULL ) -- ["66e7dbe00d4e4a002309bb6b"]',
        ]);
    });

    it('updateQuestionnaireScripts links exactly the reports named', async () => {
        const scripts = module.get<Repository<QuestionnaireScript>>(
            getRepositoryToken(QuestionnaireScript),
        );
        const [script] = await scripts.find({
            where: { questionnaireId: '66e7dbe00d4e4a002309bb6b' },
            take: 1,
            order: { id: 'ASC' },
        });

        const { error, sql } = await recorder.observe(() =>
            module.get(QuestionnaireScriptService).updateQuestionnaireScripts({
                id: script.id,
                update: { reportIds: [2, 4, 2] },
            }),
        );

        expect(error).toBeUndefined();
        const stored = await scripts.findOne({
            where: { id: script.id },
            relations: ['reports'],
        });
        expect(stored.reports.map(report => report.id).sort()).toEqual([2, 4]);
        expect(sql).toContain(
            'SELECT ... FROM "report" "Report" WHERE ( "Report"."id" IN ($1, $2) ) AND ( "Report"."deletedAt" IS NULL ) -- [2,4]',
        );
    });

    it('insert gives a new report exactly the roles named', async () => {
        const { result, error, sql } = await recorder.observe(() =>
            module.get(ReportService).insert({
                name: 'P1 report',
                description: 'Invented',
                resources: 'patient',
                roles: [3, 5],
            }),
        );

        expect(error).toBeUndefined();
        const stored = await module
            .get<Repository<Report>>(getRepositoryToken(Report))
            .findOne({ where: { id: result.id }, relations: ['roles'] });
        expect(stored.roles.map(role => role.id).sort()).toEqual([3, 5]);
        expect(sql).toContain(
            'SELECT ... FROM "role" "Role" WHERE ( "Role"."id" IN ($1, $2) ) AND ( "Role"."deletedAt" IS NULL ) -- [3,5]',
        );
    });

    it('update gives a report exactly the roles named', async () => {
        const { error, sql } = await recorder.observe(() =>
            module.get(ReportService).update({
                id: 1,
                update: {
                    name: 'Report',
                    description: 'Invented',
                    resources: 'patient',
                    roles: [4, 6],
                },
            }),
        );

        expect(error).toBeUndefined();
        const stored = await module
            .get<Repository<Report>>(getRepositoryToken(Report))
            .findOne({ where: { id: 1 }, relations: ['roles'] });
        expect(stored.roles.map(role => role.id).sort()).toEqual([4, 6]);
        expect(sql).toContain(
            'SELECT ... FROM "role" "Role" WHERE ( "Role"."id" IN ($1, $2) ) AND ( "Role"."deletedAt" IS NULL ) -- [4,6]',
        );
    });
});
