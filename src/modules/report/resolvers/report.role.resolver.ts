import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Resolver, InputType, Mutation } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { PermissionEnum } from "src/modules/permission/enums/permission.enum";
import { UsePermission } from "src/modules/permission/decorators/permission.decorator";

import { CreateOneInputType } from "@nestjs-query/query-graphql";
import { ReportRoleInput } from "../dtos/report-role-input";
import { ReportRole } from "../models/report-role.model";
import { ReportRoleService } from "../services/report.role.service";
import { ReportService } from "../services/report.service";



@InputType()
export class CreateOneReportRoleInput extends CreateOneInputType('reportRole', ReportRoleInput) { }

@Resolver(() => ReportRole)
@UseGuards(GqlAuthGuard)
export class ReportRoleResolver {
    constructor(
        private readonly reportRoleService: ReportRoleService,
        private readonly reportService: ReportService

    ) { }

    @Mutation(() => ReportRole)
    async addRolesToReport(
        @Args('input', { type: () => CreateOneReportRoleInput }) input: CreateOneReportRoleInput,
    ): Promise<PromiseSettledResult<ReportRole>[]> {
        try {
            const { reportId, roleIds } = input['reportRole']
            const existingReport = await this.reportService.findById(reportId);
            if (!existingReport) throw new BadRequestException('Invalid report');
            const insertQueries = [];
            for (const roleId of roleIds) {
                insertQueries.push(this.reportRoleService.insert(roleId, reportId))
            }

            return await Promise.allSettled(insertQueries);
        } catch (error) {
            return error
        }
    }
}