import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Assessment } from './models/assessment.model';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { AssessmentService } from './services/assessment.service';
import { AssessmentResolver } from './resolvers/assessment.resolver';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';
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
        QuestionnaireModule,
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
        PublicAssessmentResolver,
    ],
})
export class AssessmentModule {}
