import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Country } from './models/country.model';
import { SortDirection } from '@nestjs-query/core';
import { UsePermission } from '../permission/decorators/permission.decorator';
import { PermissionEnum } from '../permission/enums/permission.enum';
import { PermissionGuard } from '../permission/guards/permission.guard';


const guards = [GqlAuthGuard, PermissionGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [
                NestjsQueryTypeOrmModule.forFeature([
                    Country
                ])
            ],
            // describe the resolvers you want to expose
            resolvers: [{
                DTOClass: Country,
                EntityClass: Country,
                guards: guards,
                read: { defaultSort: [{ field: 'id', direction: SortDirection.DESC }] },
                create: { decorators: [UsePermission(PermissionEnum.MANAGE_SYSCONFIG)] },
                update: { decorators: [UsePermission(PermissionEnum.MANAGE_SYSCONFIG)] },
                delete: { decorators: [UsePermission(PermissionEnum.MANAGE_SYSCONFIG)] },
            }],
        }),
    ]
})
export class ListsModule { }
