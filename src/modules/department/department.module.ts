import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Department } from './models/department.model';


@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([Department])],
            // describe the resolvers you want to expose
            resolvers: [
                {
                    DTOClass: Department,
                    EntityClass: Department,
                    guards: [GqlAuthGuard],
                },
            ],
        }),
    ],
})
export class DepartmentModule { }
