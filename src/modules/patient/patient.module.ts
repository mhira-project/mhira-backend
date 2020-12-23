import { SortDirection } from '@nestjs-query/core';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { CreatePatientInput } from './dto/create-patient.input';
import { UpdatePatientInput } from './dto/update-patient.input';
import { EmergencyContact } from './models/emergency-contact.model';
import { Informant } from './models/informant.model';
import { PatientStatus } from './models/patient-status.model';
import { Patient } from './models/patient.model';
import { CaseManagerService } from './providers/case-manager.service';
import { CaseManagerResolver } from './resolvers/case-manager.resolver';

const guards = [GqlAuthGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([
                Patient,
                Informant,
                EmergencyContact,
                PatientStatus,
            ])],
            // describe the resolvers you want to expose
            resolvers: [
                {
                    DTOClass: Patient,
                    EntityClass: Patient,
                    CreateDTOClass: CreatePatientInput,
                    UpdateDTOClass: UpdatePatientInput,
                    guards: guards,
                    read: { defaultSort: [{ field: 'id', direction: SortDirection.DESC }] },
                },
                {
                    DTOClass: Informant,
                    EntityClass: Informant,
                    guards: guards,
                    read: { defaultSort: [{ field: 'id', direction: SortDirection.DESC }] },
                },
                {
                    DTOClass: EmergencyContact,
                    EntityClass: EmergencyContact,
                    guards: guards,
                    read: { defaultSort: [{ field: 'id', direction: SortDirection.DESC }] },
                },
                {
                    DTOClass: PatientStatus,
                    EntityClass: PatientStatus,
                    guards: guards,
                    read: { defaultSort: [{ field: 'id', direction: SortDirection.DESC }] },
                },
            ],
        }),
    ],
    providers: [
        CaseManagerService,
        CaseManagerResolver,
    ],
})
export class PatientModule { }
