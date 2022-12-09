import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateEmail, SendMailInput, UpdateEmail } from "../dtos/mail.dto";
import { Mail } from "../models/mail.model";

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        @InjectRepository(Mail)
        private mailRepository: Repository<Mail>,
    ) {}

    async sendEmail(payload: SendMailInput): Promise<string> {
        await this.mailerService.sendMail({
            to: payload.to,
            from: payload.from,
            subject: payload.subject,
            template: 'test',
            context: {
              test: payload
            }
        })
        return "Success"
    }

    async createEmailTemplate(input: CreateEmail): Promise<Mail> {
        try {
            const mail = this.mailRepository.create(input)
            return this.mailRepository.save(mail)
            // return "success"
        } catch (error) {
            console.log(error)
        }
    }

    async deleteEmailTemplate(emailId: number) {
        try {
            await this.mailRepository.delete(emailId)
            return "Success"
        } catch (error) {
            console.log(error)
        }
    }

    async updateEmailTemplate(input: UpdateEmail): Promise<Mail> {
        // const { id, ...data} = input

        try {
            let email = await this.mailRepository.findOneOrFail(input.id)

            email.name = input.name
            email.subject = input.subject
            email.body = input.body
            email.module = input.module

            return email.save();
        } catch(error) {
            console.log(error)
        }
    } 
}