import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { CreateAssessmentInput } from './dtos/create-assessment.input';
import { UpdateAssessmentInput } from './dtos/update-assessment.input';
import { Assessment } from './models/assessment.model';

const guards = [GqlAuthGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([Assessment])],
            // describe the resolvers you want to expose
            resolvers: [{
                DTOClass: Assessment,
                EntityClass: Assessment,
                CreateDTOClass: CreateAssessmentInput,
                UpdateDTOClass: UpdateAssessmentInput,
                read: { guards },
                create: { guards },
                update: { guards },
                delete: { guards },
            }],
        }),
    ],
})
export class AssessmentModule { }
