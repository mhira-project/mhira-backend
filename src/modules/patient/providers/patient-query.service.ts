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


    async getQuestionnaireReport(id: number, status?: string, questionnaireId?: string): Promise<PatientReport> {
        const condition = status ? `assessments.status = '${status}'` : 'true'
        const patient = await this.repo.findOne({
            join: { alias: 'patient', leftJoinAndSelect: { assessments: 'patient.assessments' } },
            where: qb => {
                qb.where({
                    id
                }).andWhere(condition);
            },
        }
        );

        const queries = [] as Promise<QuestionnaireAssessment>[];
        let answeredQuestionnaires = [];
        const answers = [];

        for (const assessment of patient.assessments) {
            queries.push(this.questionnaireAssessmentService.getById(assessment.questionnaireAssessmentId))
        }
        const questionnaireAssessment = await Promise.all(queries);
        for (const assessment of questionnaireAssessment) {

            assessment.questionnaires.forEach(entry => {
                if (questionnaireId == entry._id.toString()) {
                    answeredQuestionnaires.push({ ...entry, assessmentId: assessment._id.toString(), ...entry._doc })
                    answers.push(assessment.answers)
                }
            })

        }

        answeredQuestionnaires.forEach((answeredQuestionnaire, _index) => {

            answeredQuestionnaire.questionnaireFullName = answeredQuestionnaire?._doc?.questionnaire?.abbreviation;
            answeredQuestionnaire.language = answeredQuestionnaire._doc.questionnaire?.language;
            const answeredQuestionsMap = PatientQueryService.mapAnsweredQuestions(answers[_index]);
            const [questionChoices, questions] = PatientQueryService.flattenAnsweredQuestionnaireChoices(answeredQuestionnaire.questionGroups ?? [], answeredQuestionsMap);


            answeredQuestionnaire.choices = questionChoices;
            answeredQuestionnaire.answeredQuestions = questions;
            for (const question of answeredQuestionnaire.answeredQuestions.flat()) {

                const { _doc: { multipleChoiceValue, textValue } } = question;
                question.answerValue = multipleChoiceValue?.length ? multipleChoiceValue : textValue;
                question.answerChoiceLabel = PatientQueryService.getChoiceLabelByValue(question.answerValue, answeredQuestionnaire.choices)
            }
        })

        return {
            ...patient,
            answeredQuestionnaires,
        } as PatientReport;

    }

    private static flattenAnsweredQuestionnaireChoices(questionGroups: IQuestionGroup[], answersMap: IAnswerMap) {

        let choices = [] as QuestionnaireChoice[];
        let questions = []

        for (let question of questionGroups[0].questions) {
            const { _id, type, name, label, required, choices: questionChoices } = question;
            choices = choices.concat(questionChoices);
            questions.push({ _id, type, name, label, required, questionChoices, ...answersMap[(question._id).toString()] })
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
