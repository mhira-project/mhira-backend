import { SortDirection } from '@nestjs-query/core';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { UsePermission } from './decorators/permission.decorator';
import { AllowRoleType } from './decorators/role-type.decorator';
import { PermissionEnum } from './enums/permission.enum';
import { RoleCode } from './enums/role-code.enum';
import { PermissionGuard } from './guards/permission.guard';
import { RoleTypeGuard } from './guards/role-type.guard';
import { Permission } from './models/permission.model';
import { Role } from './models/role.model';

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
                        decorators: [UsePermission(PermissionEnum.VIEW_ROLES_PERMISSIONS)]
                    },
                    create: { disabled: true },
                    update: { disabled: true },
                    delete: { disabled: true },
                },
                {
                    DTOClass: Role,
                    EntityClass: Role,
                    guards: [
                        GqlAuthGuard,
                        PermissionGuard,
                        RoleTypeGuard,
                    ],
                    decorators: [AllowRoleType(RoleCode.SUPER_ADMIN)], // restrict access to super-admin role
                    read: {
                        defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
                        decorators: [UsePermission(PermissionEnum.VIEW_ROLES_PERMISSIONS)]
                    },
                    create: { decorators: [UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)] },
                    update: { decorators: [UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)] },
                    delete: { decorators: [UsePermission(PermissionEnum.MANAGE_ROLES_PERMISSIONS)] },
                },
            ],
        }),
    ],
    providers: [
        PermissionGuard,
    ],
    exports: [
        PermissionGuard,
    ]
})
export class PermissionModule { }
