import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Department } from './models/department.model';
import { SortDirection } from '@nestjs-query/core';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { UsePermission } from '../permission/decorators/permission.decorator';
import { PermissionEnum } from '../permission/enums/permission.enum';

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
            // describe the resolvers you want to expose
            resolvers: [
                {
                    DTOClass: Department,
                    EntityClass: Department,
                    guards: [GqlAuthGuard, PermissionGuard],
                    read: { defaultSort: [{ field: 'id', direction: SortDirection.DESC }] },
                    create: { decorators: [UsePermission(PermissionEnum.MANAGE_SETTINGS)] },
                    update: { decorators: [UsePermission(PermissionEnum.MANAGE_SETTINGS)] },
                    delete: { decorators: [UsePermission(PermissionEnum.MANAGE_SETTINGS)] },
                },
            ],
        }),
    ],
})
export class DepartmentModule { }
