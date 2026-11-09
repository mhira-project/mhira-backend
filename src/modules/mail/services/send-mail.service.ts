import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { Repository } from 'typeorm';
import { AssessmentEmailStatus } from 'src/modules/assessment/enums/assessment-emailstatus.enum';
import Handlebars from 'handlebars';
import * as CryptoJS from 'crypto-js';
import { url } from '../../../shared';
import { configService } from 'src/config/config.service';
import { QuestionnaireAssessmentService } from 'src/modules/questionnaire/services/questionnaire-assessment.service';
import { AssessmentStatus } from 'src/modules/questionnaire/enums/assessment-status.enum';

@Injectable()
export class SendMailService {
    private readonly logger = new Logger(SendMailService.name);

    constructor(
        private questionnaireAssessmentService: QuestionnaireAssessmentService,
        private mailerService: MailerService,
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async checkAssessmentEmails() {
        try {
            const selectAssessment = await this.assessmentRepository
                .createQueryBuilder('assessment')
                .leftJoinAndSelect('assessment.mailTemplate', 'mailTemplate')
                .where(
                    `(Extract(epoch FROM (assessment.deliveryDate - now()))/60)::integer <= 0 
                    AND assessment.emailStatus = 'SCHEDULED'`,
                )
                .getMany();

            // Not awaited, so every due reminder is sent at once. From Node 15
            // on an unhandled rejection ends the process, and the reminder,
            // still SCHEDULED, would end it again a minute later (BUGS.md,
            // B52). A reminder that fails before its status is written is
            // logged here and stays SCHEDULED, so the next run tries it again.
            selectAssessment.forEach(assessmentInfo => {
                this.sendEmail(assessmentInfo).catch((error: unknown) =>
                    this.logger.error(
                        `checkAssessmentEmails: the reminder of assessment ${assessmentInfo.id} failed and stays SCHEDULED (B52)`,
                        error instanceof Error ? error.stack : String(error),
                    ),
                );
            });
        } catch (error) {
            return error;
        }
    }

    async sendAssessmentEmail(id: number) {
        try {
            const assessment = await this.assessmentRepository.findOneOrFail({
                where: { id },
                relations: ['mailTemplate'],
            });

            if (!assessment.mailTemplate) {
                throw new Error('Mail template not found!');
            }

            if (!assessment.emailReminder || !assessment.receiverEmail) {
                throw new Error('Email is required!');
            }

            await this.sendEmail(assessment);
            return true;
        } catch (error) {
            return error;
        }
    }

    async sendEmail(assessmentInfo: Assessment) {
        const mailTemplate = assessmentInfo.mailTemplate;

        const questionnaireAssessment = await this.questionnaireAssessmentService.getById(
            assessmentInfo.questionnaireAssessmentId.toString(),
        );

        if (
            questionnaireAssessment.status === AssessmentStatus.CANCELLED ||
            (assessmentInfo.expirationDate && new Date(assessmentInfo.expirationDate) < new Date()) ||
            assessmentInfo.deleted ||
            !mailTemplate
        ) {
            return await this.assessmentRepository.update(assessmentInfo.id, {
                emailStatus: AssessmentEmailStatus.FAILED,
            });
        }

        Handlebars.registerHelper('helperMissing', function(val) {
            if (val === undefined) {
                return null;
            }
            return val;
        });

        const template = Handlebars.compile(mailTemplate.body);

        const url = this.generateAssessmentURL(assessmentInfo.uuid);

        const templateData = {
            // name: assessmentInfo.patient.firstName,
            link: url,
        };

        await this.mailerService
            .sendMail({
                to: assessmentInfo.receiverEmail,
                from: configService.getSenderMail(),
                subject: mailTemplate.subject,
                html: template(templateData),
            })
            .then(async () => {
                await this.assessmentRepository.update(assessmentInfo.id, {
                    emailStatus: AssessmentEmailStatus.SENT,
                });
            })
            .catch(async () => {
                await this.assessmentRepository.update(assessmentInfo.id, {
                    emailStatus: AssessmentEmailStatus.FAILED,
                });
            });
    }

    private generateAssessmentURL(assesmentUuid: string): string {
        const secretKey = configService.getFrontendEncryptionKey();

        const cryptoId = CryptoJS.AES.encrypt(
            assesmentUuid,
            secretKey,
        ).toString();

        return url(
            `assessment/overview?assessment=${encodeURIComponent(cryptoId)}`,
        );
    }
}
