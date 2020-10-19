import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Permission } from './models/permission.model';
import { Role } from './models/role.model';

const guards = [GqlAuthGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([Permission, Role])],
            // describe the resolvers you want to expose
            resolvers: [
                {
                    DTOClass: Permission,
                    EntityClass: Permission,
                    read: { guards },
                    create: { disabled: true },
                    update: { disabled: true },
                    delete: { disabled: true },
                },
                {
                    DTOClass: Role,
                    EntityClass: Role,
                    read: { guards },
                    create: { guards },
                    update: { guards },
                    delete: { guards },
                }
            ],
        }),
    ]
})
export class PermissionModule { }
