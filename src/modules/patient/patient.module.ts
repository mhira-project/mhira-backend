import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/models/user.model';
import { CreatePatientInput } from './dto/create-patient.input';
import { UpdatePatientInput } from './dto/update-patient.input';
import { Patient } from './models/patient.model';
import { CaseManagerService } from './providers/case-manager.service';
import { PatientService } from './providers/patient.service';
import { PatientRepository } from './repositories/patient.repository';
import { PatientClinicianResolver } from './resolvers/case-managers.resolver';
import { PatientResolver } from './resolvers/patient.resolver';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PatientRepository,
        ]),
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([Patient])],
            // describe the resolvers you want to expose
            resolvers: [{
                DTOClass: Patient,
                EntityClass: Patient,
                CreateDTOClass: CreatePatientInput,
                UpdateDTOClass: UpdatePatientInput,
            }],
        }),
    ],
    providers: [
        PatientService,
        CaseManagerService,
        PatientResolver,
        PatientClinicianResolver,
    ]
})
export class PatientModule { }
