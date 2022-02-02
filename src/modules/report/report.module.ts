import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { SortDirection } from '@nestjs-query/core';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { Report } from './models/report.model';
import { ReportRole } from './models/report-role.model';
import { ReportService } from './services/report.service';
import { ReportResolver } from './resolvers/report.resolver';
import { ReportInput } from './dtos/report-input';
import { ReportRoleInput } from './dtos/report-role-input';
import { ReportRoleResolver } from './resolvers/report.role.resolver';
import { ReportRoleService } from './services/report.role.service';

const guards = [GqlAuthGuard, PermissionGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            imports: [NestjsQueryTypeOrmModule.forFeature([
                Report,
                ReportRole,
            ])],
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
                    update: { disabled: false },
                    delete: { disabled: true },
                },
                {
                    DTOClass: ReportRole,
                    EntityClass: ReportRole,
                    CreateDTOClass: ReportRoleInput,
                    guards: guards,
                    read: {
                        defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
                        disabled: false,
                    },
                    create: { disabled: true },
                    update: { disabled: false },
                    delete: { disabled: true },
                },
            ],
        }),
    ],
    providers: [
        ReportService,
        ReportResolver,
        ReportRoleResolver,
        ReportRoleService,
    ],
    exports: [
        ReportService,
        ReportRoleService,
    ],
})

export class ReportModule { }
