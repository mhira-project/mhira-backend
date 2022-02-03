import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { Caregiver } from './models/caregiver.model';
import { CaregiverService } from './services/caregiver.service';
import { SortDirection } from '@nestjs-query/core';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { PatientCaregiver } from './models/patient-caregiver.model';
import { CaregiverResolver } from './resolvers/caregiver.resolver';
import { CaregiverInput } from './dtos/caregiver.input';
import { PatientCaregiverResolver } from './resolvers/patient-caregiver.resolver';
import { PatientCaregiverService } from './services/patient.caregiver.service';
import { PatientCaregiverInput } from './dtos/patient.caregiver.input';

const guards = [GqlAuthGuard, PermissionGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            imports: [NestjsQueryTypeOrmModule.forFeature([
                Caregiver,
                PatientCaregiver
            ])],
            resolvers: [
                {
                    DTOClass: Caregiver,
                    EntityClass: Caregiver,
                    CreateDTOClass: CaregiverInput,
                    guards: guards,
                    read: {
                        defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
                    },
                    create: { disabled: true },
                    update: { decorators: [UsePermission(PermissionEnum.MANAGE_CAREGIVERS)] },
                    delete: { disabled: true },
                },
                {
                    DTOClass: PatientCaregiver,
                    EntityClass: PatientCaregiver,
                    CreateDTOClass: PatientCaregiverInput,
                    guards: guards,
                    read: {
                        defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
                        decorators: [UsePermission(PermissionEnum.VIEW_ALL_CAREGIVERS)],
                    },
                    create: { disabled: true },
                    update: { decorators: [UsePermission(PermissionEnum.MANAGE_CAREGIVERS)] },
                    delete: { decorators: [UsePermission(PermissionEnum.DELETE_CAREGIVERS)] },
                },
            ],
        }),
    ],
    providers: [
        CaregiverService,
        CaregiverResolver,
        PatientCaregiverResolver,
        PatientCaregiverService,
    ],
    exports: [
        CaregiverService
    ],
})

export class CaregiverModule { }
