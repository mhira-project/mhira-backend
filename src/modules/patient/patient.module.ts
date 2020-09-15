import { Module } from '@nestjs/common';
import { PatientService } from './providers/patient.service';
import { PatientResolver } from './resolvers/patient.resolver';

@Module({
    providers: [
        PatientService,
        PatientResolver,
    ]
})
export class PatientModule { }
