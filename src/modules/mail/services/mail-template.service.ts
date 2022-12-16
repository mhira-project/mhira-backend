import { ConnectionType } from '@nestjs-query/query-graphql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    CreateEmailTemplate,
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
export class MailTemplateService {
    constructor(
        @InjectRepository(MailTemplate)
        private mailTemplateRepository: Repository<MailTemplate>,
        @InjectQueryService(MailTemplate)
        private readonly mailTemplateQueryService: QueryService<MailTemplate>,
    ) {}

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

    async deleteEmailTemplate(templateId: number) {
        try {
            const template = await this.mailTemplateRepository.findOne(
                templateId,
            );

            if (!template) {
                throw new NotFoundException('Mail template not found!');
            }

            await this.mailTemplateRepository.delete(templateId);
            return true;
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
