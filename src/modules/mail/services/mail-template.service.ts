import { ConnectionType } from '@nestjs-query/query-graphql';
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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
} from '@nestjs-query/core';
import { Department } from 'src/modules/department/models/department.model';
import { Patient } from 'src/modules/patient/models/patient.model';
import { AssessmentTypeEnum } from 'src/modules/assessment/enums/assessment-type.enum';

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

    async getPatientEmailTemplates(patientId: number) {
        if (!patientId) {
            return [];
        }

        const patient = await Patient.findOneOrFail({
            where: { id: patientId },
            relations: ['departments'],
        });

        const mailTemplates = await this.mailTemplateRepository
            .createQueryBuilder('mailTemplate')
            .leftJoin('mailTemplate.departments', 'department')
            .where('mailTemplate.status = :status', {
                status: AssessmentTypeEnum.ACTIVE,
            })
            .andWhere(
                new Brackets(subQb => {
                    subQb.where('department.id IN(:...ids)', {
                        ids: patient.departments.map(
                            department => department.id,
                        ),
                    });
                    subQb.orWhere('mailTemplate.isPublic = true');
                }),
            )
            .getMany();

        return mailTemplates;
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
                relations: ['departments'],
            });

            for (const [key, value] of Object.entries(values)) {
                mailTemplate[key] = value;
            }

            let departments: any = [];

            if (!values.isPublic) {
                departments = await Department.find({
                    where: departmentIds.map(id => ({ id: id })),
                });
            }

            mailTemplate.departments = departments;

            return mailTemplate.save();
        } catch (error) {
            return error;
        }
    }
}
