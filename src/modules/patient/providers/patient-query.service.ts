import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { Patient } from '../models/patient.model';
import { CreatePatientInput } from '../dto/create-patient.input';
import { UpdatePatientInput } from '../dto/update-patient.input';

@QueryService(Patient)
export class PatientQueryService extends TypeOrmQueryService<Patient> {
    constructor(@InjectRepository(Patient) repo: Repository<Patient>) {
        // pass the use soft delete option to the service.
        super(repo, { useSoftDelete: true });
    }

    async createOnePatient(input: CreatePatientInput): Promise<Patient> {

        const patient = await super.createOne(input);

        if (input.departmentIds) {
            await super.addRelations('departments', patient.id, input.departmentIds);
        }

        return patient;
    }

    async createManyPatient(input: CreatePatientInput[]): Promise<Patient[]> {

        const patients = await super.createMany(input);

        let counter = 0;

        for (const patient of patients) {

            if (input[counter++].departmentIds) {
                await super.addRelations('departments', patient.id, input[counter++].departmentIds);
            }
        };

        return patients;
    }

}
