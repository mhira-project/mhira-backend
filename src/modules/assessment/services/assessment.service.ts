import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Types } from 'mongoose';
import { getConnection, Repository } from 'typeorm';
import {
    CreateFullAssessmentInput,
    UpdateFullAssessmentInput,
} from '../dtos/create-assessment.input';
import { Assessment, FullAssessment } from '../models/assessment.model';
import { QuestionnaireAssessmentService } from '../../questionnaire/services/questionnaire-assessment.service';
import { Filter, InjectQueryService, mergeFilter, QueryService, SortDirection } from '@nestjs-query/core';
import { AssessmentConnection, AssessmentQuery } from '../dtos/assessment.query';
import { PatientAuthorizer } from 'src/modules/patient/authorizers/patient.authorizer';
import { User } from 'src/modules/user/models/user.model';
import { ConnectionType } from '@nestjs-query/query-graphql';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';

@Injectable()
export class AssessmentService {
    constructor(
        private questionnaireAssessmentService: QuestionnaireAssessmentService,
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
        @InjectQueryService(Assessment)
        private readonly assessmentQueryService: QueryService<Assessment>,
        private readonly patientQueryService: PatientQueryService,
    ) { }

    getQuestionnaireAssessment(id: string) {
        return this.questionnaireAssessmentService.getById(id);
    }

    /**
     * Get assessments filter by authorized departments.
     * 
     * @param query 
     * @param currentUser 
     * @returns 
     */
    async getAssessments(query: AssessmentQuery, currentUser: User): Promise<ConnectionType<Assessment>> {
        const patientAuthorizeFilter = await PatientAuthorizer.authorizePatient(currentUser?.id);

        /**
         * Get Current User's patients
         * 
         * This is required to filter assessment by patient departments
         * as the current filter mechanism does not support nested
         * filter that is more than 3 relationships deep.
         * 
         * @TODO add caching for current users patients for performance
         */
        const currentUsersPatients = await this.patientQueryService.query({ filter: patientAuthorizeFilter });

        // Return empty result if no department assigned
        if (currentUsersPatients.length === 0) {
            return AssessmentConnection.createFromPromise(
                () => Promise.resolve([]),
                query,
                () => Promise.resolve(0),
            );
        }

        const combinedFilter = mergeFilter(query.filter, {
            patientId: {
                in: currentUsersPatients.map(patient => patient.id)
            },
        });

        // Apply combined authorized filter
        query.filter = combinedFilter;

        // Apply default sort if not provided
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];

        return AssessmentConnection.createFromPromise(
            (q) => this.assessmentQueryService.query(q),
            query,
            (q) => this.assessmentQueryService.count(q),
        );
    }

    /**
     * Get assessment if authorized. Throws exception if Not Found
     * 
     * @param assessmentId 
     * @param currentUser 
     * @returns 
     */
    async getAssessment(assessmentId: number, currentUser: User): Promise<Assessment> {

        const patientAuthorizeFilter = await PatientAuthorizer.authorizePatient(currentUser?.id);

        const combinedFilter = mergeFilter({ id: { eq: assessmentId } } as Filter<Assessment>, { patient: patientAuthorizeFilter });

        const assessments = await this.assessmentQueryService.query({ paging: { limit: 1 }, filter: combinedFilter });

        const assessment = assessments?.[0];

        if (!assessment) {
            throw new NotFoundException();
        }

        return assessment;
    }

    async createNewAssessment(assessmentInput: CreateFullAssessmentInput) {
        let assessment: Assessment;

        // create mongo assessment
        const questionnaireAssessment = await this.questionnaireAssessmentService.createNewAssessment(
            assessmentInput.questionnaires,
        );

        try {
            // create postgres assessment
            assessment = new Assessment();
            assessment.name = assessmentInput.name;
            assessment.patientId = assessmentInput.patientId;
            assessment.clinicianId = assessmentInput.clinicianId;
            assessment.informant = assessmentInput.informant;
            assessment.questionnaireAssessmentId = questionnaireAssessment.id;
            await assessment.save();
        } catch (err) {
            // undo mongo assessment and rethrow
            await questionnaireAssessment.remove();
            throw err;
        }

        return assessment;
    }

    /**
     * Retrieve Postgres Assessment with link to patients and clinicians and mongodb Assessment with link to questionnaires
     * @param assessmentId
     * @returns
     */
    async getFullAssessment(assessmentId: number): Promise<FullAssessment> {
        const assessment: FullAssessment = (await this.assessmentRepository.findOne(
            assessmentId,
            { relations: ['clinician', 'patient'] },
        )) as FullAssessment;
        assessment.questionnaireAssessment = await this.questionnaireAssessmentService.getById(assessment.questionnaireAssessmentId);
        return assessment;
    }

    async updateAssessment(assessmentInput: UpdateFullAssessmentInput) {
        // find postgres assessment
        const assessment = await this.assessmentRepository.findOneOrFail(
            assessmentInput.assessmentId,
        );

        // find & update mongo assessment
        let questionnaireAssessment = await this.questionnaireAssessmentService.getById(assessment.questionnaireAssessmentId);
        const originalQuestionnaires = [...questionnaireAssessment.questionnaires] as Types.ObjectId[];
        questionnaireAssessment = await this.questionnaireAssessmentService.updateAssessment(
            questionnaireAssessment,
            assessmentInput.questionnaires
        );

        try {
            // update postgres assessment
            assessment.name = assessmentInput.name;
            assessment.patientId = assessmentInput.patientId;
            assessment.clinicianId = assessmentInput.clinicianId;
            assessment.informant = assessmentInput.informant;
            assessment.questionnaireAssessmentId = questionnaireAssessment.id;
            await assessment.save()
        } catch (err) {
            // undo mongo changes
            await this.questionnaireAssessmentService.updateAssessment(questionnaireAssessment, originalQuestionnaires);
            throw err;
        }

        return assessment;
    }

    public async deleteAssessment(id: number, archive = true) {
        const assessment = await this.assessmentRepository.findOneOrFail(id);
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        if (!archive) await queryRunner.manager.delete(Assessment, id);

        try {
            await this.questionnaireAssessmentService.deleteAssessment(assessment.questionnaireAssessmentId as any as Types.ObjectId, archive);
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
