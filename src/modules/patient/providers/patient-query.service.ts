import { QueryService, mergeFilter } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../models/patient.model';
import { CreatePatientInput } from '../dto/create-patient.input';
import { User } from 'src/modules/user/models/user.model';
import { PatientAuthorizer } from '../authorizers/patient.authorizer';
import { NotFoundException } from '@nestjs/common';
@QueryService(Patient)
export class PatientQueryService extends TypeOrmQueryService<Patient> {
    constructor(@InjectRepository(Patient) repo: Repository<Patient>) {
        // pass the use soft delete option to the service.
        super(repo, { useSoftDelete: true });
    }

    /**
     * Get patient if authorized. Throws exception if Not Found
     * 
     * @param currentUser 
     * @param patientId 
     * @returns 
     * 
     * @throws NotFoundException
     */
    async getOnePatient(currentUser: User, patientId: number) {

        const authorizeFilter = await PatientAuthorizer.authorizePatient(currentUser?.id);

        const combinedFilter = mergeFilter({ id: { eq: patientId } }, authorizeFilter);

        const patients = await super.query({ paging: { limit: 1 }, filter: combinedFilter });

        const patient = patients?.[0];

        if (!patient) {
            throw new NotFoundException();
        }

        return patient;
    }

    async createOne(input: CreatePatientInput): Promise<Patient> {

        const patient = await super.createOne(input);

        if (input.departmentIds) {
            await super.addRelations('departments', patient.id, input.departmentIds);
        }

        return patient;
    }

    async createMany(input: CreatePatientInput[]): Promise<Patient[]> {

        const patients = await super.createMany(input);

        let counter = 0;

        for (const patient of patients) {

            if (input[counter++].departmentIds) {
                await super.addRelations('departments', patient.id, input[counter++].departmentIds);
            }
        }

        return patients;
    }

}
