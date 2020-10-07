import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserConnectionDto } from "src/modules/user/dto/user-connection.model";
import { User } from "src/modules/user/models/user.model";
import { applySearchQuery } from "src/shared/helpers/search.helper";
import { paginate } from "src/shared/pagination/services/paginate";
import { PaginationArgs } from "src/shared/pagination/types/pagination.args";
import { CaseManagerFilter } from "../dto/case-manager.filter";
import { PatientConnectionDto } from "../dto/patient-connection.model";
import { PatientCaseManager } from "../models/patient-case-manager.model";
import { PatientInformant } from "../models/patient-informant.model";
import { PatientRepository } from "../repositories/patient.repository";

@Injectable()
export class CaseManagerService {

    constructor(
        @InjectRepository(PatientRepository)
        private readonly patientRepository: PatientRepository,
    ) { }

    getPatientInformants(patientId: number, paginationArgs: PaginationArgs): Promise<UserConnectionDto> {

        const query = User
            .createQueryBuilder('informant')
            .innerJoin("informant.patientToInformant", "patientInformant", "patientInformant.patientId = :patientId", { patientId })

        return paginate(query, paginationArgs, 'informant.id');
    }

    getPatientCaseManagers(caseManagerFilter: CaseManagerFilter): Promise<UserConnectionDto> {

        const query = User
            .createQueryBuilder('caseManager');

        // apply global search
        if (caseManagerFilter.searchKeyword) {
            applySearchQuery(query, caseManagerFilter.searchKeyword, User.searchable)
        }

        // Filter by patientId
        if (caseManagerFilter.patientId) {
            query.innerJoin(
                "caseManager.patientToCaseManager",
                "patientCaseManager",
                "patientCaseManager.patientId = :patientId",
                { patientId: caseManagerFilter.patientId });
        }

        // Filter by Case Manager Id
        else if (caseManagerFilter.caseManagerId) {
            query.innerJoin(
                "caseManager.patientToCaseManager",
                "patientCaseManager",
                "patientCaseManager.caseManagerId = :caseManagerId",
                { caseManagerId: caseManagerFilter.caseManagerId });
        }

        // Filter all case-managers
        else {
            query.innerJoin(
                "caseManager.patientToCaseManager",
                "patientCaseManager",
            );
        }

        return paginate(query, caseManagerFilter, 'caseManager.id');
    }

    async unassignPatientInformant(patientId: number, informantId: number): Promise<boolean> {
        const result = await PatientInformant.createQueryBuilder('informant')
            .delete()
            .where({
                patientId,
                informantId,
            })
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

        if (informant) {
            return true;
        }

        informant = PatientInformant.create({ patientId, informantId });
        const result = await informant.save();

        return result ? true : false;
    }

    async unassignPatientCaseManager(patientId: number, caseManagerId: number): Promise<boolean> {

        const result = await PatientCaseManager.createQueryBuilder()
            .delete()
            .where({
                patientId,
                caseManagerId,
            })
            .execute()

        return result.affected > 0;
    }

    async assignPatientCaseManager(patientId: number, caseManagerId: number): Promise<boolean> {

        let caseManager: PatientCaseManager;

        caseManager = await PatientCaseManager.createQueryBuilder()
            .where({
                patientId,
                caseManagerId,
            })
            .getOne();

        if (caseManager) {
            return true;
        }

        caseManager = PatientCaseManager.create({ patientId, caseManagerId });
        const result = await caseManager.save();

        return result ? true : false;
    }

}
