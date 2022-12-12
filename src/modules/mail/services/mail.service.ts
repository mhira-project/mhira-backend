import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateEmail, SendMailInput, UpdateEmail } from "../dtos/mail-template.dto";
import { MailTemplate } from "../models/mail-template.model";

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        @InjectRepository(MailTemplate)
        private mailTemplateRepository: Repository<MailTemplate>,
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

    async getEmailTemplate(id: number): Promise<MailTemplate> {
        try {
            const data = await this.mailTemplateRepository.findOneOrFail(id)
            console.log(data)
            return data;
        } catch (error) {
            return error
        }
    }

    async getAllEmailTemplates(): Promise<MailTemplate[]> {
        try {
            return this.mailTemplateRepository.find()
        } catch (error) {
            return error
        }
    }

    async createEmailTemplate(input: CreateEmail): Promise<MailTemplate> {
        try {
            console.log(input)
            const mail = this.mailTemplateRepository.create(input)
            return this.mailTemplateRepository.save(mail)
        } catch (error) {
            return error
        }
    }

    async deleteEmailTemplate(emailId: number) {
        try {
            await this.mailTemplateRepository.delete(emailId)
            return "Success"
        } catch (error) {
            return error
        }
    }

    async updateEmailTemplate(input: UpdateEmail): Promise<MailTemplate> {
        try {
            let email = await this.mailTemplateRepository.findOneOrFail(input.id)

            email.name = input.name
            email.subject = input.subject
            email.body = input.body
            email.module = input.module

            return email.save();
        } catch(error) {
            return error
        }
    } 
}