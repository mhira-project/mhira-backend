import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { Logs } from './logs.model';
import { User } from '../user/models/user.model';
import { GqlAuthGuard } from '../auth/auth.guard';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { LogsResolver } from './logs.resolver';
import { LoggingInterceptor } from './logs.interceptor';

const guards = [GqlAuthGuard, PermissionGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            imports: [NestjsQueryTypeOrmModule.forFeature([Logs, User])],
            resolvers: [
                {
                    DTOClass: Logs,
                    EntityClass: Logs,
                    guards,
                    // handled by assessment resolver
                    read: { disabled: true },
                    create: { disabled: true },
                    update: { disabled: true },
                    delete: { disabled: true },
                },
            ],
        }),
    ],
    providers: [LoggingInterceptor, LogsResolver],
    exports: [LoggingInterceptor]
})
export class LogsModule {}
