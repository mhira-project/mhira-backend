import { ConnectionType } from '@nestjs-query/query-graphql';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
import { MailTemplate } from '../models/mail-template.model';
import {
    InjectQueryService,
    QueryService,
    SortDirection,
    mergeFilter
} from '@nestjs-query/core';
import { User } from 'src/modules/user/models/user.model';

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
        currentUser: User
    ): Promise<ConnectionType<MailTemplate>> {
        const user = await User.findOne({ where: { id: currentUser.id}, relations: ['departments'] })

        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];

        const combinedFilter = mergeFilter<any>(query.filter, {
            departmentId: {
                in: user.departments.map(department => department.id)
            },
        });

        query.filter = combinedFilter

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
    ):Promise<MailTemplate> {
        const { id, ...values } = input
        try {
            const data = await this.mailTemplateRepository
                .createQueryBuilder()
                .update(MailTemplate, { ...values })
                .where("id = :id", { id: id })
                .returning("*")
                .updateEntity(true)
                .execute();
            
            if (!data.affected) throw new NotFoundException("Mail template not found!")

            return data.raw[0]
            
        } catch (error) {
            return error;
        }
    }
}
