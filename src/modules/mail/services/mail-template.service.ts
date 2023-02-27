import { ConnectionType } from '@nestjs-query/query-graphql';
import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
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
    mergeFilter,
} from '@nestjs-query/core';
import { User } from 'src/modules/user/models/user.model';
import { Department } from 'src/modules/department/models/department.model';

@Injectable()
export class MailTemplateService {
    constructor(
        @InjectRepository(MailTemplate)
        private mailTemplateRepository: Repository<MailTemplate>,
        @InjectQueryService(MailTemplate)
        private readonly mailTemplateQueryService: QueryService<MailTemplate>,
    ) {}

    async getEmailTemplate(id: number): Promise<MailTemplate> {
        return this.mailTemplateRepository.findOneOrFail(id);
    }

    async getAllEmailTemplates(
        query: MailTemplateQuery,
        currentUser: User,
    ): Promise<ConnectionType<MailTemplate>> {
        const user = await User.findOne({
            where: { id: currentUser.id },
            relations: ['departments'],
        });

        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];

        if (!currentUser.isSuperUser) {
            const combinedFilter = mergeFilter<any>(query.filter, {
                or: [
                    {
                        departments: {
                            id: {
                                in: user.departments.map(
                                    department => department.id,
                                ),
                            },
                        },
                    },
                    {
                        isPublic: { eq: true },
                    },
                ],
            });

            query.filter = combinedFilter;
        }

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
        const { departmentIds, ...restInput } = input;

        if (!departmentIds.length && !restInput.isPublic) {
            throw new Error('Select at least one department!');
        }

        try {
            const mail = this.mailTemplateRepository.create(restInput);

            const departments: any = await Department.find({
                where: departmentIds.map(id => ({ id: id })),
            });

            mail.departments = departments;

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
        const { id, departmentIds, ...values } = input;

        if (!departmentIds.length && !values.isPublic) {
            throw new Error('Select at least one department!');
        }

        try {
            const mailTemplate = await this.mailTemplateRepository.findOne({
                where: {
                    id,
                },
                relations: ['departments']
            });

            for (const [key, value] of Object.entries(values)) {
                mailTemplate[key] = value
            }

            const departments: any = await Department.find({
                where: departmentIds.map(id => ({ id: id })),
            });

            mailTemplate.departments = departments;

            return mailTemplate.save()
        } catch (error) {
            return error;
        }
    }
}
