import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PatientCaregiverInput } from "../dtos/patient.caregiver.input";
import { PatientCaregiver } from "../models/patient-caregiver.model";
@Injectable()
export class PatientCaregiverService extends TypeOrmQueryService<PatientCaregiver> {

    constructor(@InjectRepository(PatientCaregiver) repo: Repository<PatientCaregiver>) {
        super(repo, { useSoftDelete: true });
    }

    async insert(patientCaregiver: PatientCaregiverInput) {
        const isExisting = await this.repo.findOne({ where: { ...patientCaregiver } });
        if (isExisting) throw new ConflictException();

        let newPatientCaregiver = this.repo.create();
        newPatientCaregiver = this.repo.merge(newPatientCaregiver, patientCaregiver);
        return this.repo.save(newPatientCaregiver)
    }
}
