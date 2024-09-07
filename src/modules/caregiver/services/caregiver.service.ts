import { TypeOrmQueryService } from "@nestjs-query/query-typeorm";
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { Connection, Repository } from "typeorm";
import { CaregiverInput } from "../dtos/caregiver.input";
import { Caregiver } from "../models/caregiver.model";
import { CONNECTION } from "src/modules/tenancy/tenancy.symbols";

@Injectable()
export class DynamicCaregiverQueryService extends TypeOrmQueryService<Caregiver> {
    constructor(@Inject(CONNECTION) connection: Connection) {
        super(connection.getRepository(Caregiver));
    }
}

@Injectable()
export class CaregiverService extends TypeOrmQueryService<Caregiver> {
    public repo: Repository<Caregiver>;
    constructor(@Inject(CONNECTION) private connection: Connection) {
        super(connection.getRepository(Caregiver), { useSoftDelete: true });
    }

    async insert(caregiver: CaregiverInput) {
        const isExisting = await this.repo.findOne({ where: { phone: caregiver.phone } });
        if (isExisting) throw new ConflictException();

        let newCaregiver = this.repo.create();
        newCaregiver = this.repo.merge(newCaregiver, caregiver);
        return this.repo.save(newCaregiver)
    }
}
