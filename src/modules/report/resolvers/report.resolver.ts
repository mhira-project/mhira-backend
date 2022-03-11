import { UseGuards } from '@nestjs/common';
import {
    Args,
    ArgsType,
    Resolver,
    Query,
    InputType,
    Mutation,
    Int,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';

import { Report } from '../models/report.model';

import { SortDirection } from '@nestjs-query/core';
import { CreateOneInputType, QueryArgsType } from '@nestjs-query/query-graphql';
import { ReportService } from '../services/report.service';
import { ReportInput } from '../dtos/report-input';
import { ReportQuery, ReportQueryConnection } from '../dtos/report-args';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { User } from 'src/modules/user/models/user.model';

@InputType()
export class CreateOneReportInput extends CreateOneInputType(
    'report',
    ReportInput,
) {}

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
        try {
            return await this.reportService.getReportsByResource(
                resource,
                currentUser,
            );
        } catch (error) {
            return error;
        }
    }

    @Mutation(() => Report)
    async createOneReport(
        @Args('input', { type: () => CreateOneReportInput })
        input: CreateOneReportInput,
    ): Promise<any> {
        const caregiverInput = input['report'] as ReportInput;
        return this.reportService.insert(caregiverInput);
    }

    @Mutation(() => Int)
    async deleteReport(
        @Args('input', { type: () => Int })
        input: number,
    ): Promise<any> {
        return this.reportService.delete(input);
    }
}
