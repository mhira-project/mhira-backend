import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { Repository } from 'typeorm';
import { AssessmentEmailStatus } from 'src/modules/assessment/enums/assessment-emailstatus.enum';
import { MailTemplate } from '../models/mail-template.model';
import { TemplateModule } from '../enums/template-module.enum'
import Handlebars from 'handlebars';

@Injectable()
export class SendMailService {
    constructor(
        private mailerService: MailerService,
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
        @InjectRepository(MailTemplate)
        private mailTemplateRepository: Repository<MailTemplate>
    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    async checkEmailDeliveries() {
        try {
            const mailTemplate = await this.mailTemplateRepository.findOne({ module: TemplateModule.ASSESSMENT})
            
            if (!mailTemplate) return;

            const selectAssessment = await this.assessmentRepository
                .createQueryBuilder('assessment')
                .where(
                    `Extract(epoch FROM (assessment.deliveryDate - now()))/60 BETWEEN 0 AND 30 
                    AND assessment.emailStatus = 'SCHEDULED'`,
                )
                .leftJoinAndSelect('assessment.patient', 'patient')
                .getMany();
            
            selectAssessment.map(async assessmentInfo => {
                await this.sendEmail(assessmentInfo, mailTemplate)
            });

        } catch (error) {
            console.log(error);
        }
    }

    async sendEmail(assessmentInfo: any, mailTemplate: any) {
            const template = Handlebars.compile(mailTemplate.body)

            const templateData = {
                name: assessmentInfo.patient.firstName,
                link: "http://www.website.com"
            }

            await this.mailerService.sendMail({
                to: assessmentInfo.emailReminder,
                from: 'dummyemail@email.com',
                subject: mailTemplate.subject,
                html: template(templateData),
            })
            .then(async() => {
                await this.assessmentRepository.update(assessmentInfo.id, {
                    emailStatus: AssessmentEmailStatus.SENT,
                });
            })
            .catch(async(error) => {
                await this.assessmentRepository.update(assessmentInfo.id, {
                    emailStatus: AssessmentEmailStatus.FAILED,
                });
                console.log(error)
            })
    }
}
