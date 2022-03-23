import { UseGuards } from '@nestjs/common';
import {
    Args,
    Resolver,
    Query,
    Mutation,
    ObjectType,
    PartialType,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';

import { Report } from '../models/report.model';

import { ReportService } from '../services/report.service';
import {
    CreateOneReportInput,
    DeleteOneReportInput,
    ReportInput,
    UpdateOneReportInput,
} from '../dtos/report-input';
import { ReportQuery, ReportQueryConnection } from '../dtos/report-args';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { User } from 'src/modules/user/models/user.model';

@ObjectType()
class ReportDeleteResponse extends PartialType(Report) {}

@Resolver(() => Report)
@UseGuards(GqlAuthGuard)
export class ReportResolver {
    constructor(private readonly reportService: ReportService) {}
    @Query(() => ReportQueryConnection)
    async reports(@Args({ type: () => ReportQuery }) query: ReportQuery) {
        return this.reportService.getReports(query);
    }

    @Query(() => [Report])
    async getReportsByResource(
        @Args('resource', { type: () => String }) resource: string,
        @CurrentUser() currentUser: User,
    ): Promise<any> {
        return await this.reportService.getReportsByResource(
            resource,
            currentUser,
        );
    }

    @Mutation(() => Report)
    async createOneReport(
        @Args('input', { type: () => CreateOneReportInput })
        input: CreateOneReportInput,
    ): Promise<any> {
        const caregiverInput = input['report'] as ReportInput;
        return this.reportService.insert(caregiverInput);
    }

    @Mutation(() => Report)
    async updateOneReport(
        @Args('input', { type: () => UpdateOneReportInput })
        input: UpdateOneReportInput,
    ): Promise<any> {
        return this.reportService.update(input);
    }

    @Mutation(() => ReportDeleteResponse)
    async deleteReport(
        @Args('input', { type: () => DeleteOneReportInput })
        input: DeleteOneReportInput,
    ): Promise<any> {
        return this.reportService.delete(input);
    }
}
