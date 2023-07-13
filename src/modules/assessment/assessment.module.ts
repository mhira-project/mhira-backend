import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Assessment } from './models/assessment.model';
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
    Questionnaire,
    QuestionnaireSchema,
} from '../questionnaire/models/questionnaire.schema';
import { PatientModule } from '../patient/patient.module';
import { PublicAssessmentResolver } from './resolvers/public.assesment.resolver';
import { User } from '../user/models/user.model';
import { Caregiver } from '../caregiver/models/caregiver.model';
import { AssessmentTypeService } from './services/assessment-type.service';
import { AssessmentTypeResolver } from './resolvers/assessment-type.resolver';
import { AssessmentType } from './models/assessment-type.model';

const guards = [GqlAuthGuard, PermissionGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [
                NestjsQueryTypeOrmModule.forFeature([
                    Assessment,
                    User,
                    Caregiver,
                    AssessmentType,
                ]),

                MongooseModule.forFeature([
                    {
                        name: QuestionnaireAssessment.name,
                        schema: AssessmentSchema,
                    },
                    { name: Answer.name, schema: AnswerSchema },
                    {
                        name: Questionnaire.name,
                        schema: QuestionnaireSchema,
                    },
                ]),
            ],
            // describe the resolvers you want to expose
            resolvers: [
                {
                    DTOClass: Assessment,
                    EntityClass: Assessment,
                    guards,
                    // handled by assessment resolver
                    read: { disabled: true },
                    create: { disabled: true },
                    update: { disabled: true },
                    delete: { disabled: true },
                },
            ],
        }),
        PatientModule,
    ],
    providers: [
        AssessmentService,
        AssessmentTypeService,
        AssessmentTypeResolver,
        AssessmentResolver,
        QuestionnaireAssessmentService,
        PublicAssessmentResolver,
    ],
})
export class AssessmentModule {}
