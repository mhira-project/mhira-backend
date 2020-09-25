import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserConnection } from "src/modules/user/dto/user-connection.model";
import { User } from "src/modules/user/models/user.model";
import { applySearchQuery } from "src/shared/helpers/search.helper";
import { paginate } from "src/shared/pagination/services/paginate";
import { PaginationArgs } from "src/shared/pagination/types/pagination.args";
import { CreatePatientInput } from "../dto/create-patient.input";
import { PatientConnection } from "../dto/patient-connection.model";
import { PatientFilter } from "../dto/patient.filter";
import { UpdatePatientInput } from "../dto/update-patient.input";
import { PatientCaseManager } from "../models/patient-case-manager.model";
import { PatientInformant } from "../models/patient-informant.model";
import { Patient } from "../models/patient.model";
import { PatientRepository } from "../repositories/patient.repository";

@Injectable()
export class CaseManagerService {

    constructor(
        @InjectRepository(PatientRepository)
        private readonly patientRepository: PatientRepository,
    ) { }

    getPatientInformants(patientId: number, paginationArgs: PaginationArgs): Promise<UserConnection> {

        const query = User
            .createQueryBuilder('informants')
            .leftJoin("caseManagers.patients", "patients", "patients.id = :patientId", { patientId })

        return paginate(query, paginationArgs);
    }

    getPatientCaseManagers(patientId: number, paginationArgs: PaginationArgs): Promise<UserConnection> {

        const query = User
            .createQueryBuilder('caseManagers')
            .leftJoin("caseManagers.patients", "patients", "patients.id = :patientId", { patientId })

        return paginate(query, paginationArgs);
    }

    getCaseManagerPatients(clinicianId: number): Promise<PatientConnection> {
        throw new Error("Method not implemented.");
    }

    async unassignPatientInformant(patientId: number, informantId: number): Promise<boolean> {
        const result = await PatientCaseManager.createQueryBuilder()
            .where({
                patientId,
                informantId,
            })
            .delete()
            .execute()


        return result.affected > 0;
    }

    async assignPatientInformant(patientId: number, informantId: number): Promise<boolean> {
        let informant: PatientInformant;

        informant = await PatientInformant.createQueryBuilder()
            .where({
                patientId,
                informantId,
            })
            .getOne();

        if (!informant) {
            informant = await PatientInformant.create({ patientId, informantId });
        }

        return informant ? true : false;
    }

    async unassignPatientCaseManager(patientId: number, clinicianId: number): Promise<boolean> {

        const result = await PatientCaseManager.createQueryBuilder()
            .where({
                patientId,
                clinicianId,
            })
            .delete()
            .execute()


        return result.affected > 0;
    }

    async assignPatientCaseManager(patientId: number, clinicianId: number): Promise<boolean> {

        let caseManager: PatientCaseManager;

        caseManager = await PatientCaseManager.createQueryBuilder()
            .where({
                patientId,
                clinicianId,
            })
            .getOne();

        if (!caseManager) {
            caseManager = await PatientCaseManager.create({ patientId, clinicianId });
        }

        return caseManager ? true : false;
    }

}
