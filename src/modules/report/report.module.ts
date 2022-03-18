import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { SortDirection } from '@nestjs-query/core';
import { Report } from './models/report.model';
import { ReportService } from './services/report.service';
import { ReportResolver } from './resolvers/report.resolver';
import { ReportInput } from './dtos/report-input';
import { Role } from '../permission/models/role.model';

const guards = [GqlAuthGuard, PermissionGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            imports: [NestjsQueryTypeOrmModule.forFeature([Report, Role])],
            resolvers: [
                {
                    DTOClass: Report,
                    EntityClass: Report,
                    CreateDTOClass: ReportInput,
                    guards: guards,
                    read: {
                        disabled: true,
                    },
                    create: { disabled: true },
                    update: { disabled: true },
                    delete: { disabled: true },
                },
            ],
        }),
    ],
    providers: [ReportService, ReportResolver],
    exports: [ReportService],
})
export class ReportModule {}
