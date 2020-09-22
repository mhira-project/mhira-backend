import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { applySearchQuery } from "src/shared/helpers/search.helper";
import { paginate } from "src/shared/pagination/services/paginate";
import { CreatePatientInput } from "../dto/create-patient.input";
import { PatientConnection } from "../dto/patient-connection.model";
import { PatientFilter } from "../dto/patient.filter";
import { UpdatePatientInput } from "../dto/update-patient.input";
import { Patient } from "../models/patient.model";
import { PatientRepository } from "../repositories/patient.repository";

@Injectable()
export class PatientService {

    constructor(
        @InjectRepository(PatientRepository)
        private readonly patientRepository: PatientRepository,
    ) { }

    async list(filter: PatientFilter): Promise<PatientConnection> {

        const query = this.patientRepository.createQueryBuilder()
            .select();

        if (filter.searchKeyword) {

            applySearchQuery(query, filter.searchKeyword, Patient.searchable);

        }

        return paginate(query, filter);
    }

    async getOne(id: number): Promise<Patient> {

        return this.patientRepository.findOneOrFail({ id });
    }

    async create(input: CreatePatientInput): Promise<Patient> {
        // TODO Authorize create for user
        // # User can create resource

        // TODO De-duplicate (How?? TBP)

        const patient = this.patientRepository.create();
        patient.firstName = input.firstName;
        patient.middleName = input.firstName;
        patient.lastName = input.lastName;
        patient.medicalRecordNo = input.medicalRecordNo;
        patient.active = input.active;
        patient.phone = input.phone;
        patient.email = input.email;
        patient.address = input.address;
        patient.gender = input.gender;
        patient.birthDate = input.birthDate;
        patient.birthCountryCode = input.birthCountryCode;
        patient.nationality = input.nationality;

        return this.patientRepository.save(patient);
    }

    async update(patientId: number, input: UpdatePatientInput): Promise<Patient> {

        // TODO Authorize create for user
        // # User can update resource

        const patient = await this.patientRepository.findOneOrFail({ id: patientId });

        patient.firstName = input.firstName ?? patient.firstName;
        patient.middleName = input.firstName ?? patient.middleName;
        patient.lastName = input.lastName ?? patient.lastName;
        patient.medicalRecordNo = input.medicalRecordNo ?? patient.medicalRecordNo;
        patient.active = input.active ?? patient.active;
        patient.phone = input.phone ?? patient.phone;
        patient.email = input.email ?? patient.email;
        patient.address = input.address ?? patient.address;
        patient.gender = input.gender ?? patient.gender;
        patient.birthDate = input.birthDate ?? patient.birthDate;
        patient.birthCountryCode = input.birthCountryCode ?? patient.birthCountryCode;
        patient.nationality = input.nationality ?? patient.nationality;

        return this.patientRepository.save(patient);
    }

    async delete(patientId: number): Promise<boolean> {

        // Soft-deletes the patient record
        const result = await this.patientRepository.createQueryBuilder()
            .softDelete()
            .where({ id: patientId })
            .execute();

        return (result.affected > 0);
    }
}
