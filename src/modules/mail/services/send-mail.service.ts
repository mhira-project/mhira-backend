import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { Repository } from 'typeorm';
import { AssessmentEmailStatus } from 'src/modules/assessment/enums/assessment-emailstatus.enum';

@Injectable()
export class SendMailService {
    constructor(
        private mailerService: MailerService,
        @InjectRepository(Assessment)
        private assessmentRepository: Repository<Assessment>,
    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    async checkEmailDeliveries() {
        try {
            const selectAssessment = await this.assessmentRepository
                .createQueryBuilder('assessment')
                .where(
                    `Extract(epoch FROM (assessment.deliveryDate - now()))/60 BETWEEN 0 AND 30 
                    AND assessment.emailStatus = 'NOT_SCHEDULED'`,
                )
                .getMany();

            console.log('selectedAssessment', selectAssessment);

            selectAssessment.map(async assessmentInfo => {
                await this.sendEmail(assessmentInfo)
            });

        } catch (error) {
            console.log(error);
        }
    }

    async sendEmail(assessmentInfo: any) {
            await this.mailerService.sendMail({
                to: 'dionverushi@gmail.com',
                from: 'dionverushi@gmail.com',
                subject: 'hello',
                text: 'sup',
            })
            .then(async() => {
                await this.assessmentRepository.update(assessmentInfo.id, {
                    emailStatus: AssessmentEmailStatus.SENT,
                });
                console.log("success")
            })
            .catch(async(error) => {
                console.log(error)
                await this.assessmentRepository.update(assessmentInfo.id, {
                    emailStatus: AssessmentEmailStatus.FAILED,
                });
            })
    }
}
