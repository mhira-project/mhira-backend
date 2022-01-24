import { QueryService, mergeFilter } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, PatientReport } from '../models/patient.model';
import { QuestionnaireChoice } from "../dto/patient-report.response";
import { CreatePatientInput } from '../dto/create-patient.input';
import { User } from 'src/modules/user/models/user.model';
import { PatientAuthorizer } from '../authorizers/patient.authorizer';
import { Inject, NotFoundException } from '@nestjs/common';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { QuestionnaireAssessment } from 'src/modules/questionnaire/models/questionnaire-assessment.schema';
import { Answer, IAnswerMap } from 'src/modules/questionnaire/models/answer.schema';
import { IQuestionGroup } from 'src/modules/questionnaire/models/questionnaire.schema';
@QueryService(Patient)
export class PatientQueryService extends TypeOrmQueryService<Patient> {
    @Inject(QuestionnaireAssessmentService)
    questionnaireAssessmentService: QuestionnaireAssessmentService
    constructor(@InjectRepository(Patient) repo: Repository<Patient>) {
        // pass the use soft delete option to the service.
        super(repo, { useSoftDelete: true });
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

        const authorizeFilter = await PatientAuthorizer.authorizePatient(currentUser?.id);

        const combinedFilter = mergeFilter({ id: { eq: patientId } }, authorizeFilter);

        const patients = await super.query({ paging: { limit: 1 }, filter: combinedFilter });

        const patient = patients?.[0];

        if (!patient) {
            throw new NotFoundException();
        }

        return patient;
    }

    async createOne(input: CreatePatientInput): Promise<Patient> {

        const patient = await super.createOne(input);

        if (input.departmentIds) {
            await super.addRelations('departments', patient.id, input.departmentIds);
        }

        return patient;
    }

    async createMany(input: CreatePatientInput[]): Promise<Patient[]> {

        const patients = await super.createMany(input);

        let counter = 0;

        for (const patient of patients) {

            if (input[counter++].departmentIds) {
                await super.addRelations('departments', patient.id, input[counter++].departmentIds);
            }
        }

        return patients;
    }


    async getQuestionnaireReport(id: number, status: string, questionnaireId: string): Promise<PatientReport> {
        const patient = await this.repo.findOne({
            join: { alias: 'patient', innerJoinAndSelect: { assessments: 'patient.assessments' } },

            where: qb => {
                qb.where({
                    id
                }).andWhere('assessments.status = :status', { status });
            },
        }
        );
        const queries = [] as Promise<QuestionnaireAssessment>[];
        for (const assessment of patient.assessments) {
            queries.push(this.questionnaireAssessmentService.getById(assessment.questionnaireAssessmentId))
        }
        const questionnaireAssessment = await Promise.all(queries);
        let answeredQuestionnaire;

        for (const assessment of questionnaireAssessment) {

            assessment.questionnaires.forEach(entry => {
                if (questionnaireId == entry._id.toString()) answeredQuestionnaire = entry;
            })

            if (answeredQuestionnaire) {

                answeredQuestionnaire = JSON.parse(JSON.stringify(answeredQuestionnaire))
                answeredQuestionnaire.assessmentId = assessment._id.toString();

                answeredQuestionnaire.questionnaireFullName = answeredQuestionnaire.questionnaire.abbreviation;
                answeredQuestionnaire.language = answeredQuestionnaire.questionnaire.language;
                const answeredQuestionsMap = PatientQueryService.mapAnsweredQuestions(assessment.answers);
                const [choices, questions] = PatientQueryService.flattenAnsweredQuestionnaireChoices(answeredQuestionnaire.questionGroups, answeredQuestionsMap);

                answeredQuestionnaire.choices = choices;
                answeredQuestionnaire.answeredQuestions = questions;
                for (const question of answeredQuestionnaire.answeredQuestions) {
                    const { _doc: { multipleChoiceValue, textValue } } = question;
                    question.answerValue = multipleChoiceValue?.length ? multipleChoiceValue : textValue;
                    question.answerChoiceLabel = PatientQueryService.getChoiceLabelByValue(question.answerValue, question.choices)

                }

                break;
            }
        }

        return {
            ...patient,
            answeredQuestionnaire: answeredQuestionnaire
        } as PatientReport;
    }

    private static flattenAnsweredQuestionnaireChoices(questionGroups: IQuestionGroup[], answersMap: IAnswerMap) {
        let choices = [] as QuestionnaireChoice[];
        let questions = []
        for (const group of questionGroups) {
            for (let question of group.questions) {
                questions = []
                choices = [...choices, ...question.choices]
                questions.push({ ...question, ...answersMap[(question._id).toString()] })
            }
        }
        return [choices, questions];
    }

    private static mapAnsweredQuestions(answers: Answer[]) {
        const map = {} as IAnswerMap
        for (const answer of answers) {
            map[answer.question.toString()] = answer;
        }

        return map;
    }

    private static getChoiceLabelByValue(answerValue: string | string[], choices: QuestionnaireChoice[]) {
        const answerValueAsArray: string[] = []
        const answerValueLabelMap = {} as { [key: string]: { [key: string]: string } | boolean };

        if (typeof answerValue !== "object") answerValueAsArray.push(answerValue.toString());

        for (const value of answerValueAsArray) {
            answerValueLabelMap[value] = true;
        }

        for (const choice of choices) {
            const { name, label } = choice
            if (answerValueLabelMap[name]) answerValueLabelMap[name] = { name, label }
        }
        return (Object.values(answerValueLabelMap));
    }
}
