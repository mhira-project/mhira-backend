import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { QuestionnaireAssessment } from 'src/modules/questionnaire/models/questionnaire-assessment.schema';
import { Repository } from 'typeorm';
import {
    CreateFullAssessmentInput,
    UpdateFullAssessmentInput,
} from '../dtos/create-assessment.input';
import { Assessment, FullAssessment } from '../models/assessment.model';

@Injectable()
export class AssessmentService {
    constructor(
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
        @InjectModel(QuestionnaireAssessment.name)
        private assessmentModel: Model<QuestionnaireAssessment>,
    ) {}

    async createNewTransaction() {
        const session = await this.assessmentModel.db.startSession();
        session.startTransaction();

        return session;
    }

    createNewAssessment(
        assessmentInput: CreateFullAssessmentInput,
        questionnaireAssessment: QuestionnaireAssessment,
    ) {
        const assessment = new Assessment();
        assessment.name = assessmentInput.name;
        assessment.patientId = assessmentInput.patientId;
        assessment.clinicianId = assessmentInput.clinicianId;
        assessment.informant = assessmentInput.informant;
        assessment.questionnaireAssessmentId = questionnaireAssessment.id;

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
        assessment.questionnaireAssessment = await this.assessmentModel.findById(
            assessment.questionnaireAssessmentId,
        );
        return assessment;
    }

    async updateAssessment(assessmentInput: UpdateFullAssessmentInput) {
        const assessment = await this.assessmentRepository.findOne(
            assessmentInput.assessmentId,
        );

        const session = await this.createNewTransaction();

        this.assessmentModel.findByIdAndUpdate(
            assessment.questionnaireAssessmentId,
            {
                questionnaires: assessmentInput.questionnaires,
            },
        );

        // update assessment
        delete assessmentInput.assessmentId;
        for (const key in assessmentInput) {
            if (key in assessment) assessment[key] = assessmentInput[key];
        }

        return assessment
            .save()
            .catch(err => {
                // revert questionnaires
                session.abortTransaction();
                session.endSession();
                throw err; // since we rethrow the error, we need to end the session here too (finally would not be reached imo)
            })
            .then(() => {
                session.commitTransaction();
                session.endSession();
            });
    }
}
