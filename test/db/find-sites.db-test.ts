import { getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AssessmentTypeEnum } from 'src/modules/assessment/enums/assessment-type.enum';
import { AssessmentType } from 'src/modules/assessment/models/assessment-type.model';
import { AssessmentTypeService } from 'src/modules/assessment/services/assessment-type.service';
import { Role } from 'src/modules/permission/models/role.model';
import { Questionnaire } from 'src/modules/questionnaire/models/questionnaire.schema';
import { QuestionnaireScript } from 'src/modules/questionnaire/models/questionnaire-script.model';
import { QuestionnaireScriptService } from 'src/modules/questionnaire/services/questionnaire-script.service';
import { Report } from 'src/modules/report/models/report.model';
import { ReportService } from 'src/modules/report/services/report.service';
import { lookupModule, StatementRecorder, whereLive } from './database';
import {
    newAssessmentType,
    newQuestionnaireScript,
    newReport,
    newRole,
} from './rows';

// The services' lookups of several rows by a condition. Each runs against
// data that has rows it must not return; the rows it returns or stores and
// the lookup's statement are checked.

describe('lookups of several rows', () => {
    let module: TestingModule;
    let recorder: StatementRecorder;

    beforeAll(async () => {
        ({ module, recorder } = await lookupModule(
            'mhira_test_find',
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

    /** Three roles, so that naming the first and the third leaves one out. */
    async function threeRoles(): Promise<Role[]> {
        return [await newRole(), await newRole(), await newRole()];
    }

    it('getActiveAssessmentTypes leaves out an inactive type', async () => {
        const active = [await newAssessmentType(), await newAssessmentType()];
        await newAssessmentType({ status: AssessmentTypeEnum.INACTIVE });
        await (await newAssessmentType()).softRemove();

        const { result, error, sql } = await recorder.observe(() =>
            module.get(AssessmentTypeService).getActiveAssessmentTypes(),
        );

        expect(error).toBeUndefined();
        expect(result.map(type => type.id).sort()).toEqual(
            active.map(type => type.id),
        );
        expect(sql).toEqual([
            `SELECT ... FROM "assessment_type" "AssessmentType" ${whereLive(
                'AssessmentType',
                '"AssessmentType"."status" = $1',
            )} -- ["ACTIVE"]`,
        ]);
    });

    it("getQuestionnaireScriptsById returns only that questionnaire's live scripts", async () => {
        const questionnaireId = new Types.ObjectId().toHexString();
        const live = [
            await newQuestionnaireScript({ questionnaireId }),
            await newQuestionnaireScript({ questionnaireId }),
        ];
        await (await newQuestionnaireScript({ questionnaireId })).softRemove();
        await newQuestionnaireScript();

        const { result, error, sql } = await recorder.observe(() =>
            module
                .get(QuestionnaireScriptService)
                .getQuestionnaireScriptsById(questionnaireId),
        );

        expect(error).toBeUndefined();
        expect(result.map(script => script.id).sort()).toEqual(
            live.map(script => script.id),
        );
        expect(sql).toEqual([
            `SELECT ... FROM "questionnaire_script" "QuestionnaireScript" ${whereLive(
                'QuestionnaireScript',
                '"QuestionnaireScript"."questionnaireId" = $1',
            )} -- ["${questionnaireId}"]`,
        ]);
    });

    it('updateQuestionnaireScripts links exactly the reports named', async () => {
        const script = await newQuestionnaireScript();
        const [first, , second] = [
            await newReport(),
            await newReport(),
            await newReport(),
        ];

        const { error, sql } = await recorder.observe(() =>
            module.get(QuestionnaireScriptService).updateQuestionnaireScripts({
                id: script.id,
                update: { reportIds: [first.id, second.id, first.id] },
            }),
        );

        expect(error).toBeUndefined();
        const stored = await QuestionnaireScript.findOne({
            where: { id: script.id },
            relations: ['reports'],
        });
        expect(stored.reports.map(report => report.id).sort()).toEqual([
            first.id,
            second.id,
        ]);
        expect(sql).toContain(
            `SELECT ... FROM "report" "Report" ${whereLive(
                'Report',
                '"Report"."id" IN ($1, $2)',
            )} -- [${first.id},${second.id}]`,
        );
    });

    it('insert gives a new report exactly the roles named', async () => {
        const [first, , second] = await threeRoles();
        const { result, error, sql } = await recorder.observe(() =>
            module.get(ReportService).insert({
                name: 'New report',
                description: 'Invented',
                resources: 'patient',
                roles: [first.id, second.id],
            }),
        );

        expect(error).toBeUndefined();
        const stored = await Report.findOne({
            where: { id: result.id },
            relations: ['roles'],
        });
        expect(stored.roles.map(role => role.id).sort()).toEqual([
            first.id,
            second.id,
        ]);
        expect(sql).toContain(
            `SELECT ... FROM "role" "Role" ${whereLive(
                'Role',
                '"Role"."id" IN ($1, $2)',
            )} -- [${first.id},${second.id}]`,
        );
    });

    it('update gives a report exactly the roles named', async () => {
        const [first, replaced, second] = await threeRoles();
        const report = await newReport({ roles: [replaced] });
        const { error, sql } = await recorder.observe(() =>
            module.get(ReportService).update({
                id: report.id,
                update: {
                    name: 'Renamed report',
                    description: 'Invented',
                    resources: 'patient',
                    roles: [first.id, second.id],
                },
            }),
        );

        expect(error).toBeUndefined();
        const stored = await Report.findOne({
            where: { id: report.id },
            relations: ['roles'],
        });
        expect(stored.roles.map(role => role.id).sort()).toEqual([
            first.id,
            second.id,
        ]);
        expect(sql).toContain(
            `SELECT ... FROM "role" "Role" ${whereLive(
                'Role',
                '"Role"."id" IN ($1, $2)',
            )} -- [${first.id},${second.id}]`,
        );
    });
});
