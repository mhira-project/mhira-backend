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
                    AND assessment.emailStatus = 'SCHEDULED'`,
                )
                .getMany();

            console.log('selectedAssessment', selectAssessment);

            selectAssessment.map(async assessmentInfo => {
                // await this.sendEmail(assessmentInfo)
                console.log(assessmentInfo);
            });
        } catch (error) {
            console.log(error);
        }
    }

    async sendEmail(assessmentInfo: any) {
        try {
            await this.mailerService.sendMail({
                to: 'dionverushi@gmail.com',
                from: 'dionverushi@gmail.com',
                subject: 'hello',
                text: 'sup',
            });
            await this.assessmentRepository.update(assessmentInfo.id, {
                status: AssessmentEmailStatus.SENT,
            });
        } catch (error) {
            await this.assessmentRepository.update(assessmentInfo.id, {
                status: AssessmentEmailStatus.FAILED,
            });
        }
    }
}
