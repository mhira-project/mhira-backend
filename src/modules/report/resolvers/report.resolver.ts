import { UseGuards } from '@nestjs/common';
import {
    Args,
    ArgsType,
    Resolver,
    Query,
    InputType,
    Mutation,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';

import { Report } from '../models/report.model';

import { User } from 'src/modules/user/models/user.model';
import { SortDirection } from '@nestjs-query/core';
import { CreateOneInputType, QueryArgsType } from '@nestjs-query/query-graphql';
import { ReportService } from '../services/report.service';
import { ReportInput } from '../dtos/report-input';
import { SelectQueryBuilder } from 'typeorm';

@ArgsType()
class ReportQuery extends QueryArgsType(Report) {}

const ReportConnection = ReportQuery.ConnectionType;

@InputType()
export class CreateOneReportInput extends CreateOneInputType(
    'report',
    ReportInput,
) {}

@Resolver(() => Report)
@UseGuards(GqlAuthGuard)
export class ReportResolver {
    constructor(private readonly reportService: ReportService) {}
    @Query(() => ReportConnection)
    async reports(@Args({ type: () => ReportQuery }) query: ReportQuery) {
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];
        return ReportConnection.createFromPromise(
            q => this.reportService.query(q),
            query,
            q => this.reportService.count(q),
        );
    }

    @Mutation(() => Report)
    async createOneReport(
        @Args('input', { type: () => CreateOneReportInput })
        input: CreateOneReportInput,
    ): Promise<Report> {
        const reportInput = input['report'] as ReportInput;
        return this.reportService.insert(reportInput);
    }

    @Query(() => [Report])
    async getReportsByResource(
        @Args('resource', { type: () => String }) resource: string,
        @CurrentUser() currentUser: User,
    ): Promise<any> {
        try {
            return await this.reportService.getReportsByResource(
                resource,
                currentUser.id,
            );
        } catch (error) {
            return error;
        }
    }
}
