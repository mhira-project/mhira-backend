import { SortDirection } from '@nestjs-query/core';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { UsePermission } from './decorators/permission.decorator';
import { PermissionEnum } from './enums/permission.enum';
import { RoleInput } from './dtos/role.input';
import { PermissionGuard } from './guards/permission.guard';
import { Permission } from './models/permission.model';
import { Role } from './models/role.model';
import { PermissionService } from './providers/permission.service';
import { RoleCrudService } from './providers/role-crud.service';
import { RoleResolver } from './resolvers/role.resolver';

@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [
                NestjsQueryTypeOrmModule.forFeature([
                    Permission,
                    Role,
                ]),
            ],
            // describe the resolvers you want to expose
            resolvers: [
                {
                    DTOClass: Permission,
                    EntityClass: Permission,
                    guards: [GqlAuthGuard, PermissionGuard],
                    read: {
                        defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
                        decorators: [UsePermission(PermissionEnum.VIEW_ROLES_PERMISSIONS)],
                        one: { disabled: true },
                    },
                    create: { disabled: true },
                    update: { disabled: true },
                    delete: { disabled: true },
                },
            ],
            // RoleResolver is written by hand; this registers the providers
            // its CRUDResolver needs (the Role authorizer)
            dtos: [{ DTOClass: Role, CreateDTOClass: RoleInput, UpdateDTOClass: RoleInput }],
        }),
    ],
    providers: [
        PermissionGuard,
        PermissionService,
        RoleResolver,
        RoleCrudService,
    ],
    exports: [
        PermissionGuard,
    ]
})
export class PermissionModule { }
