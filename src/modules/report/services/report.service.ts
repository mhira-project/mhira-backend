import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/modules/permission/models/role.model';
import { In, Repository } from 'typeorm';
import { ReportInput, UpdateOneReportInput } from '../dtos/report-input';
import { InjectQueryService, QueryService } from '@nestjs-query/core';
import { ConnectionType } from '@nestjs-query/query-graphql';

import { Report } from '../models/report.model';
import { ReportQueryConnection } from '../dtos/report-args';
import { User } from 'src/modules/user/models/user.model';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectQueryService(Report)
        private readonly reportQueryService: QueryService<Report>,
    ) {}

    getReports(query): Promise<ConnectionType<Report>> {
        return ReportQueryConnection.createFromPromise(
            q => this.reportQueryService.query(q),
            query,
            q => this.reportQueryService.count(q),
        );
    }

    async insert(report: ReportInput) {
        const { roles, ...rest } = report;
        const newReport = this.reportRepository.create(rest);

        const findRoles = await this.roleRepository.find({ id: In(roles) });

        newReport.roles = findRoles;

        await this.reportRepository.save(newReport);

        return newReport;
    }

    async update(input: UpdateOneReportInput): Promise<any> {
        const { id, update } = input;
        const { roles, ...rest } = update;
        const report = await this.reportRepository.findOne({
            relations: ['roles'],
            where: { id },
        });

        const findRoles = await this.roleRepository.find({
            id: In(roles),
        });

        if (findRoles.length !== roles.length)
            throw new NotFoundException('Role not found!');

        report.roles = findRoles;

        return await this.reportRepository.save({
            id,
            ...report,
            ...rest,
        });
    }

    delete(input: any) {
        return this.reportRepository.softDelete({ id: input.id });
    }

    async getReportsByResource(
        resource: string,
        currentUser: User,
    ): Promise<Report[]> {
        const user = await User.findOne({
            relations: ['roles'],
            where: { id: currentUser.id },
        });

        const userRoleIds = user.roles.map(role => role.id);

        const reports = await this.reportRepository
            .createQueryBuilder('report')
            .innerJoin('report.roles', 'roles')
            .where('report.resources = :resources', { resources: resource })
            .andWhere('report.status = :status', { status: true })
            .andWhere('roles.id IN (:...roleId)', {
                roleId: userRoleIds,
            })
            .getMany();

        return reports;
    }
}
