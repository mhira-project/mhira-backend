import { Inject, Injectable } from "@nestjs/common";
import { UserConnectionDto } from "src/modules/user/dto/user-connection.model";
import { User } from "src/modules/user/models/user.model";
import { applySearchQuery } from "src/shared/helpers/search.helper";
import { paginate } from "src/shared/pagination/services/paginate";
import { Connection, createQueryBuilder, getManager, Repository } from "typeorm";
import { CaseManagerFilter } from "../dto/case-manager.filter";
import { CONNECTION } from "src/modules/tenancy/tenancy.symbols";


@Injectable()
export class CaseManagerService {
    private userRepo: Repository<User>;
    constructor(@Inject(CONNECTION) private readonly connection: Connection) {
        this.userRepo = connection.getRepository(User);
    }

    getPatientCaseManagers(caseManagerFilter: CaseManagerFilter): Promise<UserConnectionDto> {

        const query = this.userRepo
            .createQueryBuilder('caseManager');

        // apply global search
        if (caseManagerFilter.searchKeyword) {
            applySearchQuery(query, caseManagerFilter.searchKeyword, User.searchable)
        }

        // Filter by patientId
        if (caseManagerFilter.patientId) {
            query.innerJoin(
                "caseManager.patients",
                "patient",
                "patient.id = :patientId",
                { patientId: caseManagerFilter.patientId });
        }

        // Filter by Case Manager Id
        else if (caseManagerFilter.caseManagerId) {
            query.innerJoin(
                "caseManager.patients",
                "patient",
                "caseManager.id = :caseManagerId",
                { caseManagerId: caseManagerFilter.caseManagerId });
        }

        // Filter all case-managers
        else {
            query.innerJoin(
                "caseManager.patients",
                "patient",
            );
        }

        return paginate(query, caseManagerFilter, 'caseManager.id');
    }

    async unassignPatientCaseManager(patientId: number, userId: number): Promise<boolean> {

        const result = await getManager(this.connection.name).createQueryBuilder()
            .delete()
            .from('patient_case_manager')
            .where({ patientId, userId })
            .execute();


        return result.affected > 0;
    }

    async assignPatientCaseManager(patientId: number, userId: number): Promise<boolean> {

        const caseManager = await getManager(this.connection.name)
            .createQueryBuilder()
            .from('patient_case_manager', 'patient_case_manager')
            .where({ patientId, userId })
            .getRawOne();

        if (caseManager) {
            return true;
        }


        const result = await getManager(this.connection.name).createQueryBuilder()
            .insert()
            .into('patient_case_manager')
            .values([
                { patientId, userId }
            ])
            .execute();

        return result ? true : false;
    }

}
