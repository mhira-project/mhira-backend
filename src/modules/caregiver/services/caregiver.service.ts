import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CaregiverInput } from "../dtos/caregiver.input";
import { Caregiver } from "../models/caregiver.model";
@Injectable()
export class CaregiverService extends TypeOrmQueryService<Caregiver> {

    constructor(@InjectRepository(Caregiver) repo: Repository<Caregiver>) {
        super(repo, { useSoftDelete: true });
    }

    async insert(caregiver: CaregiverInput) {
        const isExisting = await this.repo.findOne({ where: { phone: caregiver.phone } });
        if (isExisting) throw new ConflictException();

        let newCaregiver = this.repo.create();
        newCaregiver = this.repo.merge(newCaregiver, caregiver);
        return this.repo.save(newCaregiver)
    }
}
