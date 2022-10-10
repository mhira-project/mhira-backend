import {QueryService, mergeFilter} from '@nestjs-query/core';
import {TypeOrmQueryService} from '@nestjs-query/query-typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {getRepository, Repository} from 'typeorm';
import {Patient, PatientReport} from '../models/patient.model';
import {CreatePatientInput} from '../dto/create-patient.input';
import {User} from 'src/modules/user/models/user.model';
import {PatientAuthorizer} from '../authorizers/patient.authorizer';
import {Inject, NotFoundException} from '@nestjs/common';
import {QuestionnaireAssessmentService} from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import {QuestionnaireAssessment} from 'src/modules/questionnaire/models/questionnaire-assessment.schema';
import {IAnswerMap} from 'src/modules/questionnaire/models/answer.schema';
import {
    AnsweredQuestions,
    IQuestionGroup,
} from 'src/modules/questionnaire/models/questionnaire.schema';
import {AssessmentResponse} from 'src/modules/assessment/models/assessment.model';
import {QuestionnaireScriptService} from 'src/modules/questionnaire/services/questionnaire-script.service';

@QueryService(Patient)
export class PatientQueryService extends TypeOrmQueryService<Patient> {
    @Inject(QuestionnaireAssessmentService)
    questionnaireAssessmentService: QuestionnaireAssessmentService;
    @Inject(QuestionnaireScriptService)
    questionnaireScriptService: QuestionnaireScriptService;

    constructor(@InjectRepository(Patient) repo: Repository<Patient>) {
        // pass the use soft delete option to the service.
        super(repo);
    }

    /**
     * Get patient if authorized. Throws exception if Not Found
     *
     * @param currentUser
     * @param patientId
     * @returns
     *
     * @throws NotFoundException
     */
    async getOnePatient(currentUser: User, patientId: number) {
        const authorizeFilter = await PatientAuthorizer.authorizePatient(
            currentUser?.id,
        );

        const combinedFilter = mergeFilter(
            {id: {eq: patientId}},
            authorizeFilter,
        );

        const patients = await super.query({
            paging: {limit: 1},
            filter: combinedFilter,
        });

        const patient = patients?.[0];

        if (!patient) {
            throw new NotFoundException();
        }

        return patient;
    }

    async createOne(input: CreatePatientInput): Promise<Patient> {
        const patient = await super.createOne(input);

        if (input.departmentIds) {
            await super.addRelations(
                'departments',
                patient.id,
                input.departmentIds,
            );
        }

        return patient;
    }

    async archiveOnePatient(id: number) {
        const result = await this.repo
            .softDelete(id);
        console.log(result);
        return result;
    }

    async createMany(input: CreatePatientInput[]): Promise<Patient[]> {
        const patients = await super.createMany(input);

        let counter = 0;

        for (const patient of patients) {
            if (input[counter++].departmentIds) {
                await super.addRelations(
                    'departments',
                    patient.id,
                    input[counter++].departmentIds,
                );
            }
        }

        return patients;
    }

    async getQuestionnaireReport(
        id: number,
        status?: string,
        questionnaireId?: string,
    ): Promise<PatientReport> {
        const condition = status ? `assessments.status = '${status}'` : 'true';
        const patient = await this.repo.findOne({
            relations: ['assessments', 'assessments.assessmentType'],
            where: qb => {
                qb.where({
                    id,
                }).andWhere(condition);
            },
        });

        const answeredQuestionnaires = [];
        const answers = [];
        let questionnaireScripts = [];
        const assessmentResponse = [] as AssessmentResponse[];
        const questionnaireAssessment: QuestionnaireAssessment[] = []; //await Promise.all(queries);

        for (const assessment of patient.assessments) {
            const singleQuestionnaireAssessment = await this.questionnaireAssessmentService.getById(
                assessment.questionnaireAssessmentId,
            );

            if (singleQuestionnaireAssessment)
                questionnaireAssessment.push(singleQuestionnaireAssessment);

            assessmentResponse.push({
                ...assessment,
                status: singleQuestionnaireAssessment.status,
                assessmentId: assessment.questionnaireAssessmentId,
            } as AssessmentResponse);
        }

        for (const assessment of questionnaireAssessment) {
            assessment.questionnaires.forEach(entry => {
                if (
                    (questionnaireId &&
                        questionnaireId == entry._id.toString()) ||
                    !questionnaireId
                ) {
                    answeredQuestionnaires.push({
                        ...entry,
                        assessmentId: assessment._id.toString(),
                        ...entry._doc,
                    });
                    answers.push(assessment.answers);
                }
            });
        }

        for (let i = 0; i < answeredQuestionnaires.length; i++) {
            const answeredQuestionnaire = answeredQuestionnaires[i];

            const questionnaireName = answeredQuestionnaire.abbreviation;
            const questionnaireLanguage = answeredQuestionnaire.language;

            const existingScript = questionnaireScripts.some(
                script =>
                    script.questionnaireId.toString() ===
                    answeredQuestionnaire?._doc._id.toString(),
            );

            if (!existingScript) {
                const questionnaireScriptsData: any = await this.questionnaireScriptService.getQuestionnaireScriptsById(
                    answeredQuestionnaire?._doc._id.toString(),
                );

                if (questionnaireScriptsData.length !== 0) {
                    questionnaireScriptsData.map(item => {
                        item.questionnaireName = questionnaireName;
                        item.questionnaireLanguage = questionnaireLanguage;
                    });

                    questionnaireScripts = [
                        ...questionnaireScripts,
                        ...questionnaireScriptsData,
                    ];
                }
            }

            answeredQuestionnaire.abbreviation =
                answeredQuestionnaire?._doc?.questionnaire?.abbreviation;
            answeredQuestionnaire.questionnaireFullName =
                answeredQuestionnaire?._doc?.name;
            answeredQuestionnaire.language =
                answeredQuestionnaire._doc.questionnaire?.language;
            answeredQuestionnaire.name =
                answeredQuestionnaire?._doc?.questionnaire?.abbreviation;

            const answeredQuestionsMap = PatientQueryService.mapAnsweredQuestions(
                answers[i],
            );
            const questionGroups = answeredQuestionnaire._doc?.questionGroups?.flat();
            const questions = PatientQueryService.matchQuestionsToAnswers(
                questionGroups ?? [],
                answeredQuestionsMap,
            );
            answeredQuestionnaire.questions = questions;
        }

        return {
            patient,
            answeredQuestionnaires,
            questionnaireScripts,
            assessments: assessmentResponse,
        } as PatientReport;
    }

    private static mapAnsweredQuestions(answers: AnsweredQuestions[]) {
        const map = {} as IAnswerMap;
        for (const answer of answers) {
            answer.combinedDate = null;
            map[answer.question.toString()] = {...answer['_doc']};
            map[answer.question.toString()][
                'questionId'
                ] = answer.question.toString();
            if (answer.dateValue && answer.textValue) {
                const [hours, minutes] = answer.textValue.split(':');
                map[answer.question.toString()]['combinedDate'] = new Date(
                    answer.dateValue.setUTCHours(+hours, +minutes, 0, 0),
                );
            }
        }
        return map;
    }

    private static matchQuestionsToAnswers(
        questionGroups: IQuestionGroup[],
        answeredQuestionsMap: IAnswerMap,
    ) {
        let results = [];

        for (const questionGroup of questionGroups) {
            const questions = questionGroup.questions.map(question => {
                const {type, name, label, required, choices, hint} = question;
                return {
                    type,
                    variable: name,
                    label,
                    required,
                    choices,
                    hint,
                    questionGrouplabel: questionGroup.label,
                    answer: answeredQuestionsMap[question._id.toString()],
                };
            });

            results = results.concat(questions);
        }
        return results;
    }
}
