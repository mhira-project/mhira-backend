import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Questionnaire } from './models/questionnaire.model';

const guards = [GqlAuthGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([Questionnaire])],
            // describe the resolvers you want to expose
            resolvers: [{
                DTOClass: Questionnaire,
                EntityClass: Questionnaire,
                // CreateDTOClass:
                // UpdateDTOClass:
                read: { disabled: false, guards },
                create: { disabled: true },
                update: { disabled: true },
                delete: { disabled: true },
            }],
        }),
    ],
})
export class QuestionnaireModule { }
