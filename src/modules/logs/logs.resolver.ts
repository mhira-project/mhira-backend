import { ArgsType, Resolver, Query, Args } from '@nestjs/graphql';
import { Logs } from './logs.model';
import { GqlAuthGuard } from '../auth/auth.guard';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { UseGuards } from '@nestjs/common';
import { ConnectionType, QueryArgsType } from '@nestjs-query/query-graphql';
import {
    InjectQueryService,
    QueryService,
    SortDirection,
} from '@nestjs-query/core';

@ArgsType()
export class LogsQuery extends QueryArgsType(Logs) {}

export const LogsConnection = LogsQuery.ConnectionType;

@Resolver(() => Logs)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class LogsResolver {
    constructor(
        @InjectQueryService(Logs)
        private readonly logsQueryService: QueryService<Logs>,
    ) {}

    @Query(() => LogsConnection)
    async getAllLogs(
        @Args({ type: () => LogsQuery }) query: LogsQuery,
    ): Promise<ConnectionType<Logs>> {
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];

        const result: any = await LogsConnection.createFromPromise(
            q => this.logsQueryService.query(q),
            query,
            q => this.logsQueryService.count(q),
        );

        return result;
    }
}
