import { SortDirection } from '@nestjs-query/core';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { UsePermission } from '../permission/decorators/permission.decorator';
import { PermissionEnum } from '../permission/enums/permission.enum';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { CreatePatientInput } from './dto/create-patient.input';
import { EmergencyContactInput } from './dto/emergency-contact.input';
import { UpdatePatientInput } from './dto/update-patient.input';
import { EmergencyContact } from './models/emergency-contact.model';
import { Informant } from './models/informant.model';
import { PatientStatus } from './models/patient-status.model';
import { Patient } from './models/patient.model';
import { CaseManagerService } from './providers/case-manager.service';
import { CaseManagerResolver } from './resolvers/case-manager.resolver';
import { EmergencyContactResolver } from './resolvers/emergency-contact.resolver';
import { PatientResolver } from './resolvers/patient.resolver';
import { PatientQueryService } from './providers/patient-query.service';
import { QuestionnaireAssessmentService } from '../questionnaire/services/questionnaire-assessment.service';
import {
    AssessmentSchema,
    QuestionnaireAssessment,
} from '../questionnaire/models/questionnaire-assessment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from '../questionnaire/models/answer.schema';
import {
    Questionnaire,
    QuestionnaireSchema,
} from '../questionnaire/models/questionnaire.schema';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';
import { PatientStatusService } from './providers/patient-status.service';
import { Assessment } from '../assessment/models/assessment.model';

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
                    Patient,
                    Informant,
                    EmergencyContact,
                    PatientStatus,
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
                    DTOClass: Patient,
                    EntityClass: Patient,
                    CreateDTOClass: CreatePatientInput,
                    UpdateDTOClass: UpdatePatientInput,
                    guards: guards,
                    read: { disabled: true },
                    create: { disabled: true },
                    update: { disabled: true },
                    delete: { disabled: true },
                },
                {
                    DTOClass: Informant,
                    EntityClass: Informant,
                    guards: guards,
                    read: {
                        defaultSort: [
                            { field: 'id', direction: SortDirection.DESC },
                        ],
                        decorators: [
                            UsePermission(PermissionEnum.VIEW_PATIENTS),
                        ],
                    },
                    create: {
                        decorators: [
                            UsePermission(PermissionEnum.MANAGE_PATIENTS),
                        ],
                    },
                    update: {
                        decorators: [
                            UsePermission(PermissionEnum.MANAGE_PATIENTS),
                        ],
                    },
                    delete: {
                        decorators: [
                            UsePermission(PermissionEnum.MANAGE_PATIENTS),
                        ],
                    },
                },
                {
                    DTOClass: EmergencyContact,
                    EntityClass: EmergencyContact,
                    CreateDTOClass: EmergencyContactInput,
                    UpdateDTOClass: EmergencyContactInput,
                    guards: guards,
                    read: {
                        defaultSort: [
                            { field: 'id', direction: SortDirection.DESC },
                        ],
                        decorators: [
                            UsePermission(PermissionEnum.VIEW_PATIENTS),
                        ],
                    },
                    create: { disabled: true },
                    update: {
                        decorators: [
                            UsePermission(PermissionEnum.MANAGE_PATIENTS),
                        ],
                    },
                    delete: {
                        decorators: [
                            UsePermission(PermissionEnum.MANAGE_PATIENTS),
                        ],
                    },
                },
                {
                    DTOClass: PatientStatus,
                    EntityClass: PatientStatus,
                    guards: guards,
                    read: {
                        defaultSort: [
                            { field: 'id', direction: SortDirection.DESC },
                        ],
                    },
                    create: {
                        disabled: true,
                    },
                    update: {
                        decorators: [
                            UsePermission(PermissionEnum.MANAGE_SETTINGS),
                        ],
                    },
                    delete: {
                        decorators: [
                            UsePermission(PermissionEnum.MANAGE_SETTINGS),
                        ],
                    },
                },
            ],
        }),
    ],
    providers: [
        CaseManagerService,
        CaseManagerResolver,
        PatientResolver,
        EmergencyContactResolver,
        PatientQueryService,
        QuestionnaireAssessmentService,
        PatientStatusService,
    ],
    exports: [PatientQueryService],
})
export class PatientModule {}
