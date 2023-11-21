import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Types } from 'mongoose';
import { getConnection, Repository } from 'typeorm';
import {
    CreateFullAssessmentInput,
    UpdateFullAssessmentInput,
} from '../dtos/create-assessment.input';
import { Assessment, FullPublicAssessment, FullAssessment } from '../models/assessment.model';
import { QuestionnaireAssessmentService } from '../../questionnaire/services/questionnaire-assessment.service';
import {
    Filter,
    InjectQueryService,
    mergeFilter,
    QueryService,
    SortDirection,
} from '@nestjs-query/core';
import {
    AssessmentConnection,
    AssessmentQuery,
} from '../dtos/assessment.query';
import { PatientAuthorizer } from 'src/modules/patient/authorizers/patient.authorizer';
import { User } from 'src/modules/user/models/user.model';
import { ConnectionType } from '@nestjs-query/query-graphql';
import { PatientQueryService } from 'src/modules/patient/providers/patient-query.service';
import { Caregiver } from 'src/modules/caregiver/models/caregiver.model';
import { AssessmentStatus } from 'src/modules/questionnaire/enums/assessment-status.enum';
import { AssessmentType } from '../models/assessment-type.model';
import { AssessmentEmailStatus } from '../enums/assessment-emailstatus.enum';
import { Validator } from 'src/shared';

@Injectable()
export class AssessmentService {
    constructor(
        private questionnaireAssessmentService: QuestionnaireAssessmentService,
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Caregiver)
        private caregiverRepository: Repository<Caregiver>,
        @InjectQueryService(Assessment)
        private readonly assessmentQueryService: QueryService<Assessment>,
        @InjectRepository(AssessmentType)
        private readonly assessmentTypeRepo: Repository<AssessmentType>,
        private readonly patientQueryService: PatientQueryService,
    ) {}

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
    async getAssessments(
        query: AssessmentQuery,
        currentUser: User,
    ): Promise<ConnectionType<Assessment>> {
        const patientAuthorizeFilter = await PatientAuthorizer.authorizePatient(
            currentUser?.id,
        );
        /**
         * Get Current User's patients
         *
         * This is required to filter assessment by patient departments
         * as the current filter mechanism does not support nested
         * filter that is more than 3 relationships deep.
         *
         * @TODO add caching for current users patients for performance
         */
        const currentUsersPatients = await this.patientQueryService.query({
            filter: patientAuthorizeFilter,
        });

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
                in: currentUsersPatients.map(patient => patient.id),
            },
        });
        // Apply combined authorized filter
        query.filter = combinedFilter;

        // Apply default sort if not provided
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];

        const result: any = await AssessmentConnection.createFromPromise(
            q => this.assessmentQueryService.query(q),
            query,
            q => this.assessmentQueryService.count(q),
        );

        for (let i = 0; i < result.edges.length; i++) {
            const assessment = result.edges[i].node;

            await this.changeQuestionnaireAssessmentStatus(assessment);
        }

        return result;
    }
    /**
     * Get assessment if authorized. Throws exception if Not Found
     *
     * @param assessmentId
     * @param currentUser
     * @returns
     */
    async getAssessment(
        assessmentId: number,
        currentUser: User,
    ): Promise<Assessment> {
        const patientAuthorizeFilter = await PatientAuthorizer.authorizePatient(
            currentUser?.id,
        );

        const combinedFilter = mergeFilter(
            { id: { eq: assessmentId } } as Filter<Assessment>,
            { patient: patientAuthorizeFilter },
        );

        const assessments = await this.assessmentQueryService.query({
            paging: { limit: 1 },
            filter: combinedFilter,
        });

        const assessment = assessments?.[0];

        if (!assessment) {
            throw new NotFoundException();
        }

        return assessment;
    }

    async createNewAssessment(assessmentInput: CreateFullAssessmentInput) {
        const assessmentLength = assessmentInput.dates.length || 1;

        const assessmentArray = [];

        for (let i = 0; i < assessmentLength; i++) {
            let assessment: Assessment;

            const assessmentType = await this.assessmentTypeRepo.findOne(
                assessmentInput.assessmentTypeId,
            );

            if (!assessmentType) {
                throw new NotFoundException('Assessment type not found!');
            }

            // create mongo assessment
            const questionnaireAssessment = await this.questionnaireAssessmentService.createNewAssessment(
                assessmentInput.questionnaires,
                assessmentInput.questionnaireBundles
            );

            const d1 = new Date(assessmentInput?.dates[i].deliveryDate),
                d2 = new Date();

            try {
                // create postgres assessment
                assessment = new Assessment();
                if (!assessmentInput.dates[i].deliveryDate || d1 < d2) {
                    await this.questionnaireAssessmentService.changeAssessmentStatus(
                        questionnaireAssessment.id,
                        AssessmentStatus.OPEN_FOR_COMPLETION,
                    );
                }

                assessment.status = AssessmentStatus.OPEN_FOR_COMPLETION;
                assessment.assessmentType = assessmentType;
                assessment.patientId = assessmentInput.patientId;
                assessment.clinicianId = assessmentInput.clinicianId;
                assessment.informantType = assessmentInput.informantType;
                assessment.expirationDate =
                    assessmentInput.dates[i].expirationDate;
                assessment.note = assessmentInput.note;
                assessment.deliveryDate = assessmentInput.dates[i].deliveryDate;
                assessment.questionnaireAssessmentId =
                    questionnaireAssessment.id;
                if (assessmentInput.informantClinicianId) {
                    const clinician = await this.userRepository.findOne({
                        id: assessmentInput.informantClinicianId,
                    });
                    if (!clinician)
                        throw new NotFoundException(
                            'Informant clinician not found!',
                        );
                    assessment.informantClinician = clinician;
                    // To prevent double informant
                    assessmentInput.informantCaregiverRelation = null;
                }
                if (assessmentInput.informantCaregiverRelation) {
                    assessment.informantCaregiverRelation =
                        assessmentInput.informantCaregiverRelation;
                }
                // If emailReminder is not checked then all the other email values will be edited
                assessment.emailReminder =
                    assessmentInput.emailReminder || false;
                if (!assessmentInput.emailReminder) {
                    assessment.emailStatus =
                        AssessmentEmailStatus.NOT_SCHEDULED;
                    assessment.receiverEmail = null;
                } else if (Validator.isEmail(assessmentInput.receiverEmail)) {
                    if (!assessmentInput.mailTemplateId) {
                        throw new Error('Mail template not found!');
                    }
                    assessment.mailTemplateId = assessmentInput.mailTemplateId;

                    if (!assessmentInput.dates[i].deliveryDate) {
                        assessment.emailStatus =
                            AssessmentEmailStatus.NOT_SCHEDULED;
                    } else {
                        assessment.emailStatus =
                            AssessmentEmailStatus.SCHEDULED;
                    }
                    assessment.receiverEmail = assessmentInput.receiverEmail;
                }

                await assessment.save();
                assessmentArray.push(assessment);
            } catch (err) {
                // undo mongo assessment and rethrow
                await questionnaireAssessment.remove();
                throw err;
            }
        }

        return assessmentArray[0];
    }

    /**
     * Retrieve Postgres Assessment with link to patients and clinicians and mongodb Assessment with link to questionnaires
     * @param assessmentId
     * @returns
     */
    async getFullAssessment(assessmentId: number): Promise<FullAssessment> {
        const assessment: FullAssessment = (await this.assessmentRepository.findOne(
            {
                where: {
                    id: assessmentId,
                    isActive: true,
                },
                relations: [
                    'clinician',
                    'patient',
                    'informantClinician',
                    'assessmentType',
                ],
            },
        )) as FullAssessment;

        assessment.questionnaireAssessment = await this.questionnaireAssessmentService.getById(
            assessment.questionnaireAssessmentId,
        );

        return assessment;
    }

    async updateAssessment(assessmentInput: UpdateFullAssessmentInput) {
        // find postgres assessment
        const assessment = await this.assessmentRepository.findOneOrFail(
            assessmentInput.assessmentId,
        );

        const assessmentType = await this.assessmentTypeRepo.findOne(
            assessmentInput.assessmentTypeId,
        );

        if (!assessmentType)
            throw new NotFoundException('Assessment type not found!');

        // find & update mongo assessment
        let questionnaireAssessment = await this.questionnaireAssessmentService.getById(
            assessment.questionnaireAssessmentId,
        );
        const originalQuestionnaires = [
            ...questionnaireAssessment.questionnaires,
        ] as Types.ObjectId[];
        questionnaireAssessment = await this.questionnaireAssessmentService.updateAssessment(
            questionnaireAssessment,
            assessmentInput.questionnaires,
        );

        const d1 = new Date(assessmentInput?.deliveryDate),
            d2 = new Date();

        if (!assessmentInput.deliveryDate || d1 < d2) {
            await this.questionnaireAssessmentService.changeAssessmentStatus(
                questionnaireAssessment.id,
                AssessmentStatus.OPEN_FOR_COMPLETION,
            );
        }

        try {
            // update postgres assessment
            assessment.assessmentType = assessmentType;
            assessment.patientId = assessmentInput.patientId;
            assessment.clinicianId = assessmentInput.clinicianId;
            assessment.informantType = assessmentInput.informantType;
            assessment.questionnaireAssessmentId = questionnaireAssessment.id;
            assessment.expirationDate = assessmentInput.expirationDate;
            assessment.deliveryDate = assessmentInput.deliveryDate;
            assessment.note = assessmentInput.note;
            assessment.informantCaregiverRelation = null;
            assessment.informantClinician = null;
            if (assessmentInput.informantClinicianId) {
                const clinician = await this.userRepository.findOne({
                    id: assessmentInput.informantClinicianId,
                });
                if (!clinician)
                    throw new NotFoundException(
                        'Informant clinician not found!',
                    );
                assessment.informantClinician = clinician;
                // To prevent double informant
                assessmentInput.informantCaregiverRelation = null;
            }
            if (assessmentInput.informantCaregiverRelation) {
                assessment.informantCaregiverRelation =
                    assessmentInput.informantCaregiverRelation;
            }
            // If emailReminder is not checked then all the other email values will be edited
            assessment.emailReminder = assessmentInput.emailReminder || false;
            if (!assessmentInput.emailReminder) {
                assessment.emailStatus = AssessmentEmailStatus.NOT_SCHEDULED;
                assessment.receiverEmail = null;
                assessment.mailTemplateId = null;
            } else if (Validator.isEmail(assessmentInput.receiverEmail)) {
                if (!assessmentInput.mailTemplateId) {
                    throw new Error('Mail template not found!');
                }
                assessment.mailTemplateId = assessmentInput.mailTemplateId;

                if (!assessmentInput.deliveryDate) {
                    assessment.emailStatus =
                        AssessmentEmailStatus.NOT_SCHEDULED;
                } else {
                    assessment.emailStatus = AssessmentEmailStatus.SCHEDULED;
                }
                assessment.receiverEmail = assessmentInput.receiverEmail;
            }
            await assessment.save();
        } catch (err) {
            // undo mongo changes
            await this.questionnaireAssessmentService.updateAssessment(
                questionnaireAssessment,
                originalQuestionnaires,
            );
            throw err;
        }

        return assessment;
    }

    public async deleteAssessment(id: number, statusCancel = true) {
        const assessment = await this.assessmentRepository.findOneOrFail(id);
        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        if (!statusCancel) await queryRunner.manager.delete(Assessment, id);

        try {
            await this.questionnaireAssessmentService.deleteAssessment(
                (assessment.questionnaireAssessmentId as any) as Types.ObjectId,
                statusCancel,
            );
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async archiveOneAssessment(id: number) {
        const assessment = await this.assessmentRepository.findOneOrFail(id);

        if (assessment.deleted) {
            throw Error('This assessment is already archived!');
        }

        await this.assessmentRepository.update(id, { deleted: true });

        return assessment;
    }

    async restoreOneAssessment(id: number) {
        const assessment = await this.assessmentRepository
            .createQueryBuilder('assessment')
            .leftJoinAndSelect('assessment.patient', 'patient')
            .where('assessment.id = :id', { id })
            .getOneOrFail();

        if (assessment.patient.deleted) {
            throw Error('The patient assigned to this assessment is archived!');
        }

        if (!assessment.deleted) {
            throw Error('This assessment is not archived!');
        }

        await this.assessmentRepository.update(id, { deleted: false });
        delete assessment.patient;
        return assessment;
    }

    async getFullPublicAssessment(uuid: string): Promise<FullPublicAssessment> {
        const assessment = (await this.assessmentRepository.findOne(
            {
                where: {
                    isActive: true,
                    uuid,
                },
                relations: ['assessmentType'],
            },
        ) as unknown as FullPublicAssessment);

        assessment.questionnaireAssessment = await this.changeQuestionnaireAssessmentStatus(
            assessment,
        );

        return assessment;
    }

    async changeQuestionnaireAssessmentStatus(assessment: any) {
        const questionnaireAssessment = await this.questionnaireAssessmentService.getById(
            assessment.questionnaireAssessmentId.toString(),
        );

        const expirationToDate = new Date(assessment?.expirationDate);
        const deliveryToDate = new Date(assessment?.deliveryDate);
        const newDate = new Date();

        if (
            questionnaireAssessment.status === AssessmentStatus.PLANNED &&
            assessment?.deliveryDate &&
            deliveryToDate < newDate
        ) {
            await this.questionnaireAssessmentService.changeAssessmentStatus(
                assessment.questionnaireAssessmentId,
                AssessmentStatus.OPEN_FOR_COMPLETION,
            );
            await this.assessmentRepository.update(
                { id: assessment.id },
                { status: AssessmentStatus.OPEN_FOR_COMPLETION },
            );
            questionnaireAssessment.status =
                AssessmentStatus.OPEN_FOR_COMPLETION;
        }

        if (
            assessment?.expirationDate &&
            expirationToDate < newDate &&
            questionnaireAssessment?.status !== AssessmentStatus.COMPLETED &&
            questionnaireAssessment?.status !==
                AssessmentStatus.PARTIALLY_COMPLETED
        ) {
            await this.questionnaireAssessmentService.changeAssessmentStatus(
                assessment.questionnaireAssessmentId,
                AssessmentStatus.EXPIRED,
            );
            await this.assessmentRepository.update(
                { id: assessment.id },
                { status: AssessmentStatus.EXPIRED },
            );
            questionnaireAssessment.status = AssessmentStatus.EXPIRED;
        }

        return questionnaireAssessment;
    }
}
