import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/models/user.model';
import { In, Repository } from 'typeorm';
import { ReportInput } from '../dtos/report-input';
import { ReportRole } from '../models/report-role.model';

import { Report } from '../models/report.model';
@Injectable()
export class ReportService extends TypeOrmQueryService<Report> {
    constructor(@InjectRepository(Report) repo: Repository<Report>) {
        super(repo, { useSoftDelete: true });
    }

    insert(report: ReportInput) {
        let newReport = this.repo.create();
        newReport = this.repo.merge(newReport, report);
        return this.repo.save(newReport);
    }

    async getReportsByResource(
        resource: string,
        currentUserId: number,
    ): Promise<Report[]> {
        const user = await User.findOne({
            relations: ['roles'],
            where: { id: currentUserId },
        });

        const userRoleIds = user.roles.map(role => role.id);

        const reports = await this.repo
            .createQueryBuilder('report')
            .innerJoinAndSelect(
                ReportRole,
                'reportRoles',
                'reportRoles.reportId = report.id',
            )
            .where('report.resources = :resources', { resources: resource })
            .andWhere('report.status = :status', { status: true })
            .andWhere('reportRoles.roleId IN (:...roleId)', {
                roleId: userRoleIds,
            })
            .getMany();

        return reports;
    }
}
