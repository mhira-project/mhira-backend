import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientService } from './providers/patient.service';
import { PatientRepository } from './repositories/patient.repository';
import { PatientResolver } from './resolvers/patient.resolver';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PatientRepository,
        ]),
    ],
    providers: [
        PatientService,
        PatientResolver,
    ]
})
export class PatientModule { }
