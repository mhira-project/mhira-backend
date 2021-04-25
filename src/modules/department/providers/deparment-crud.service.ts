import { DeleteManyResponse, Filter, QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../models/department.model';

@QueryService(Department)
export class DepartmentCrudService extends TypeOrmQueryService<Department> {
    constructor(@InjectRepository(Department) repo: Repository<Department>) {
        // pass the use soft delete option to the service.
        super(repo, { useSoftDelete: true });
    }

    async deleteOne(id: number | string): Promise<Department> {

        // Check deparment has user or patient assigned before deleting
        const hasUsersOrPatients = await this.deparmentIdsHaveUsersOrPatients({ id: { eq: Number(id) } });

        if (hasUsersOrPatients) {
            // Throw error if deparment has Users or Patients
            throw new BadRequestException('Cannot delete deparment! Department has Users/Patients assigned to it.');
        }

        return super.deleteOne(id);
    }

    async deleteMany(filter: Filter<Department>): Promise<DeleteManyResponse> {

        // Check deparments have user or patient assigned before deleting
        const hasUsersOrPatients = await this.deparmentIdsHaveUsersOrPatients(filter);

        if (hasUsersOrPatients) {
            // Throw error if deparment has Users or Patients
            throw new BadRequestException('Cannot delete deparments! One of more of the Departments has Users/Patients assigned to it.');
        }

        return super.deleteMany(filter);
    }

    private async deparmentIdsHaveUsersOrPatients(inputFilter: Filter<Department>): Promise<boolean> {

        const userPatientFilter = {
            or: [
                { users: { id: { isNot: null } } }, // has Users
                { patients: { id: { isNot: null } } }, // OR has Patients
            ]
        };

        // combine above inputFilter with our userPatientFilter
        const filter: Filter<Department> = {
            and: [
                inputFilter,
                userPatientFilter,
            ]
        };

        Logger.verbose(JSON.stringify(filter));
        const hasUsersOrPatients = await super.query({ filter });

        // Will evaluate true, if atleast one of the 
        // eligible department rows from supplied filter
        // has either a User or Patient assigned.
        return (hasUsersOrPatients.length > 0);
    }
}
