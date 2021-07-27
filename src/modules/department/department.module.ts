import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Department } from './models/department.model';
import { SortDirection } from '@nestjs-query/core';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { UsePermission } from '../permission/decorators/permission.decorator';
import { PermissionEnum } from '../permission/enums/permission.enum';
import { DepartmentCrudService } from './providers/deparment-crud.service';
import { DepartmentResolver } from './resolvers/departments.resolver';

@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [
                NestjsQueryTypeOrmModule.forFeature([
                    Department
                ])
            ],
            services: [DepartmentCrudService],
            // describe the resolvers you want to expose
            resolvers: [
                {
                    DTOClass: Department,
                    EntityClass: Department,
                    guards: [GqlAuthGuard, PermissionGuard],
                    ServiceClass: DepartmentCrudService,
                    read: { defaultSort: [{ field: 'id', direction: SortDirection.DESC }] },
                    create: { disabled: true },
                    update: { decorators: [UsePermission(PermissionEnum.MANAGE_SETTINGS)] },
                    delete: { decorators: [UsePermission(PermissionEnum.MANAGE_SETTINGS)] },
                },
            ],
        }),
    ],
    providers: [
        DepartmentResolver,
    ]
})
export class DepartmentModule { }
