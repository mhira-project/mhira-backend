import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CaregiverInput } from "../dtos/caregiver.input";
import { Caregiver } from "../models/caregiver.model";
@Injectable()
export class CaregiverService extends TypeOrmQueryService<Caregiver> {

    constructor(@InjectRepository(Caregiver) repo: Repository<Caregiver>) {
        super(repo, { useSoftDelete: true });
    }

    insert(caregiver: CaregiverInput) {
        let newCaregiver = this.repo.create();
        newCaregiver = this.repo.merge(newCaregiver, caregiver);
        return this.repo.save(newCaregiver)
    }
}
