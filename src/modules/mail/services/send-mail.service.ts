import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { In, Repository } from 'typeorm';
import { AssessmentEmailStatus } from 'src/modules/assessment/enums/assessment-emailstatus.enum';
import { MailTemplate } from '../models/mail-template.model';
import { TemplateModuleEnum } from '../enums/template-module.enum'
import Handlebars from 'handlebars';
import * as CryptoJS from 'crypto-js'
import { url } from '../../../shared'
import { configService } from 'src/config/config.service';

@Injectable()
export class SendMailService {
    constructor(
        private mailerService: MailerService,
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
        @InjectRepository(MailTemplate)
        private mailTemplateRepository: Repository<MailTemplate>
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async checkAssessmentEmails() {
        try {
            const mailTemplate = await this.mailTemplateRepository.findOne({ module: TemplateModuleEnum.ASSESSMENT})

            const selectAssessment = await this.assessmentRepository
                .createQueryBuilder('assessment')
                .where(
                    `(Extract(epoch FROM (assessment.deliveryDate - now()))/60)::integer = 0 
                    AND assessment.emailStatus = 'SCHEDULED'`,
                )
                .leftJoinAndSelect('assessment.patient', 'patient')
                .getMany();

            //When there is no template all received assessment emails get status failed
            if (!mailTemplate) {
                return await this.assessmentRepository.update({id: In(selectAssessment.map(({ id }) => id))}, { emailStatus: AssessmentEmailStatus.FAILED })
            }

            selectAssessment.map(async assessmentInfo => {
                await this.sendEmail(assessmentInfo, mailTemplate)
            });

        } catch (error) {
            return error
        }
    }

    async sendAssessmentEmail(id: number) {
        try {
            const assessment = await this.assessmentRepository.findOneOrFail(id)

            const mailTemplate = await this.mailTemplateRepository.findOne({ module: TemplateModuleEnum.CLIENT })

            if (!mailTemplate) {
                throw new NotFoundException("No email template found!")
            }

            await this.sendEmail(assessment, mailTemplate)
            return true
        } catch (error) {
            return error
        }
    }

    async sendEmail(assessmentInfo: Assessment, mailTemplate: MailTemplate) {
        const template = Handlebars.compile(mailTemplate.body)

        const url = this.generateAssessmentURL(assessmentInfo.uuid)

        const templateData = {
            // name: assessmentInfo.patient.firstName,
            link: url
        }

        this.mailerService.sendMail({
            to: assessmentInfo.receiverEmail,
            from: configService.getSenderMail(),
            subject: mailTemplate.subject,
            html: template(templateData),
        })
        .then(async() => {
            await this.assessmentRepository.update(assessmentInfo.id, {
                emailStatus: AssessmentEmailStatus.SENT,
            });
        })
        .catch(async() => {
            await this.assessmentRepository.update(assessmentInfo.id, {
                emailStatus: AssessmentEmailStatus.FAILED,
            });
        })
    }

    private generateAssessmentURL(assesmentUuid: string): string {
        const secretKey = configService.getFrontendEncryptionKey()

        const cryptoId = CryptoJS.AES.encrypt(assesmentUuid, secretKey).toString();
        
        return url(`assessment/overview?assessment=${cryptoId}`)
    }

}