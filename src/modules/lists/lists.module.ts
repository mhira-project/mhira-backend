import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { Country } from './models/country.model';

@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([Country])],
            // describe the resolvers you want to expose
            resolvers: [{
                DTOClass: Country,
                EntityClass: Country,
                // read: { defaultFilter: { deleted: { is: false } } },
                delete: { disabled: true },
            }],
        }),
    ]
})
export class ListsModule { }
