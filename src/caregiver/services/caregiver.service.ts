import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Caregiver } from "../models/caregiver.model";

@Injectable()
export class CaregiverService extends TypeOrmQueryService<Caregiver> {

    constructor(@InjectRepository(Caregiver) repo: Repository<Caregiver>) {
        super(repo, { useSoftDelete: true });
    }
}
