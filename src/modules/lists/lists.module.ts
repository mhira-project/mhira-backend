import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Country } from './models/country.model';
import { SortDirection } from '@nestjs-query/core';


const guards = [GqlAuthGuard];
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
                // read: { defaultFilter: { deleted: { is: false } } },
                delete: { disabled: true },
                guards: guards,
                read: { defaultSort: [{ field: 'id', direction: SortDirection.DESC }] },
            }],
        }),
    ]
})
export class ListsModule { }
