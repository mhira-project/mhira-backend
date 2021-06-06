import { SortDirection } from '@nestjs-query/core';
import { Authorizer, NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Injectable, Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { UsePermission } from './decorators/permission.decorator';
import { PermissionEnum } from './enums/permission.enum';
import { PermissionGuard } from './guards/permission.guard';
import { Permission } from './models/permission.model';
import { Role } from './models/role.model';
import { PermissionService } from './providers/permission.service';
import { RoleCrudService } from './providers/role-crud.service';
import { RoleResolver } from './resolvers/role.resolver';

@Injectable()
export class RoleAuthorizer implements Authorizer<Role> {
    async authorize() {
        return {};
    }

    async authorizeRelation() {
        return {};
    }
}

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
            ],
        }),
    ],
    providers: [
        PermissionGuard,
        PermissionService,
        RoleResolver,
        RoleCrudService,
        RoleAuthorizer,
    ],
    exports: [
        PermissionGuard,
    ]
})
export class PermissionModule { }
