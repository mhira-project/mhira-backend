import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Types } from 'mongoose';
import { getConnection, Repository } from 'typeorm';
import {
    CreateFullAssessmentInput,
    UpdateFullAssessmentInput,
} from '../dtos/create-assessment.input';
import { Assessment, FullAssessment } from '../models/assessment.model';
import { QuestionnaireAssessmentService } from '../../questionnaire/services/questionnaire-assessment.service';

@Injectable()
export class AssessmentService {
    constructor(
        private questionnaireAssessmentService: QuestionnaireAssessmentService,
        @InjectRepository(Assessment) private assessmentRepository: Repository<Assessment>,
    ) { }

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
