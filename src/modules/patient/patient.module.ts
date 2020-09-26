import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    ],
    providers: [
        PatientService,
        CaseManagerService,
        PatientResolver,
        PatientClinicianResolver,
    ]
})
export class PatientModule { }
