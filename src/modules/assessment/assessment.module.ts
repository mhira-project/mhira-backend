import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Assessment } from './models/assessment.model';
import { SortDirection } from '@nestjs-query/core';
import { UsePermission } from '../permission/decorators/permission.decorator';
import { PermissionEnum } from '../permission/enums/permission.enum';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { AssessmentService } from './services/assessment.service';
import { AssessmentResolver } from './resolvers/assessment.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import {
    AssessmentSchema,
    QuestionnaireAssessment,
} from '../questionnaire/models/questionnaire-assessment.schema';
import { Answer, AnswerSchema } from '../questionnaire/models/answer.schema';
import { QuestionnaireAssessmentService } from '../questionnaire/services/questionnaire-assessment.service';
import {
    QuestionnaireVersion,
    QuestionnaireVersionSchema,
} from '../questionnaire/models/questionnaire-version.schema';

const guards = [GqlAuthGuard, PermissionGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [
                NestjsQueryTypeOrmModule.forFeature([Assessment]),

                MongooseModule.forFeature([
                    {
                        name: QuestionnaireAssessment.name,
                        schema: AssessmentSchema,
                    },
                    { name: Answer.name, schema: AnswerSchema },
                    {
                        name: QuestionnaireVersion.name,
                        schema: QuestionnaireVersionSchema,
                    },
                ]),
            ],
            // describe the resolvers you want to expose
            resolvers: [
                {
                    DTOClass: Assessment,
                    EntityClass: Assessment,
                    guards,
                    read: {
                        guards,
                        defaultSort: [
                            { field: 'id', direction: SortDirection.DESC },
                        ],
                        decorators: [
                            UsePermission(PermissionEnum.VIEW_ASSESSMENTS),
                        ],
                    },

                    // handled by assessment resolver
                    create: { disabled: true },
                    update: { disabled: true },
                    delete: { disabled: true },
                },
            ],
        }),
    ],
    providers: [
        AssessmentService,
        AssessmentResolver,
        QuestionnaireAssessmentService,
    ],
})
export class AssessmentModule { }
