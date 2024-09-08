import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { Connection, Repository } from "typeorm";
import { PatientCaregiverInput } from "../dtos/patient.caregiver.input";
import { PatientCaregiver } from "../models/patient-caregiver.model";
import { CONNECTION } from "src/modules/tenancy/tenancy.symbols";

@Injectable()
export class DynamicPatientCaregiverQueryService extends TypeOrmQueryService<PatientCaregiver> {
    constructor(@Inject(CONNECTION) connection: Connection) {
        super(connection.getRepository(PatientCaregiver));
    }
}

@Injectable()
export class PatientCaregiverService extends TypeOrmQueryService<PatientCaregiver> {
    public repo: Repository<PatientCaregiver>;
    constructor(@Inject(CONNECTION) private connection: Connection) {
        super(connection.getRepository(PatientCaregiver), { useSoftDelete: true });
        this.repo = connection.getRepository(PatientCaregiver);
    }

    async insert(patientCaregiver: PatientCaregiverInput) {
        const isExisting = await this.repo.findOne({ where: { ...patientCaregiver } });
        if (isExisting) throw new ConflictException();

        let newPatientCaregiver = this.repo.create();
        newPatientCaregiver = this.repo.merge(newPatientCaregiver, patientCaregiver);
        return this.repo.save(newPatientCaregiver)
    }
}
