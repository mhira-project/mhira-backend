import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReportRoleInput } from "../dtos/report-role-input";
import { ReportRole } from "../models/report-role.model";


@Injectable()
export class ReportRoleService extends TypeOrmQueryService<ReportRole> {

    constructor(@InjectRepository(ReportRole) repo: Repository<ReportRole>) {
        super(repo, { useSoftDelete: true });
    }

    insert(roleId: number, reportId: number) {
        let newRoleReport = this.repo.create();
        newRoleReport = this.repo.merge(newRoleReport, { roleId, reportId });
        return this.repo.save(newRoleReport)
    }
}