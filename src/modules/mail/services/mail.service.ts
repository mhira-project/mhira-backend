import { MailerService } from '@nestjs-modules/mailer';
import { ConnectionType } from '@nestjs-query/query-graphql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    CreateEmailTemplate,
    SendMailInput,
    UpdateEmailTemplate,
} from '../dtos/mail-template.dto';
import {
    MailTemplateConnection,
    MailTemplateQuery,
} from '../dtos/mail-template.query';
import { TemplateModule } from '../enums/template-module.enum';
import { MailTemplate } from '../models/mail-template.model';
import {
    InjectQueryService,
    QueryService,
    SortDirection,
} from '@nestjs-query/core';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        @InjectRepository(MailTemplate)
        private mailTemplateRepository: Repository<MailTemplate>,
        @InjectQueryService(MailTemplate)
        private readonly mailTemplateQueryService: QueryService<MailTemplate>,
    ) {}

    async sendEmail(payload: SendMailInput): Promise<string> {
        await this.mailerService.sendMail({
            to: payload.to,
            from: payload.from,
            subject: payload.subject,
            template: 'test',
            context: {
                test: payload,
            },
        });
        return 'Success';
    }

    async getEmailTemplate(id: number): Promise<MailTemplate> {
        try {
            const data = await this.mailTemplateRepository.findOneOrFail(id);
            return data;
        } catch (error) {
            return error;
        }
    }

    async getAllEmailTemplates(
        query: MailTemplateQuery,
    ): Promise<ConnectionType<MailTemplate>> {
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];

        const result: any = await MailTemplateConnection.createFromPromise(
            q => this.mailTemplateQueryService.query(q),
            query,
            q => this.mailTemplateQueryService.count(q),
        );

        return result;
    }

    async createEmailTemplate(
        input: CreateEmailTemplate,
    ): Promise<MailTemplate> {
        try {
            if (
                !Object.values(TemplateModule).some(
                    value => value === input.module,
                )
            ) {
                throw new NotFoundException('Module input is incorrect!');
            }

            const mail = this.mailTemplateRepository.create(input);
            return this.mailTemplateRepository.save(mail);
        } catch (error) {
            return error;
        }
    }

    async deleteEmailTemplate(emailId: number) {
        try {
            await this.mailTemplateRepository.delete(emailId);
            return 'Success';
        } catch (error) {
            return error;
        }
    }

    async updateEmailTemplate(
        input: UpdateEmailTemplate,
    ): Promise<MailTemplate> {
        try {
            let email = await this.mailTemplateRepository.findOneOrFail(
                input.id,
            );

            email.name = input.name;
            email.subject = input.subject;
            email.body = input.body;
            email.status = input.status;
            email.module = input.module;

            return email.save();
        } catch (error) {
            return error;
        }
    }
}
