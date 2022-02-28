import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReportInput } from "../dtos/report-input";

import { Report } from "../models/report.model";
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

    getReportsByResource(resource: string) {
        return this.repo.find({ where: { resources: resource, status: true } })
    }
}
