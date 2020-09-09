import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InstitutionRepository } from './institution.repository';
import { Institution } from './models/institution.model';
import { InstitutionInput } from './dto/institution.input';
import { InstitutionFilter } from './dto/institution.filter';
import { User } from 'src/modules/user/models/institution-user.model';
import { InstitutionUpdateInput } from './dto/institution-update.dto';
import { PaginationArgs } from 'src/shared/pagination/types/pagination.args';
import { PaginatedInstitution } from './dto/paginated-institution.model';
import { applySearchQuery } from 'src/shared/helpers/search.helper';
import { paginate } from 'src/shared/pagination/services/paginate';
import { Any } from 'typeorm';
import * as randomstring from 'randomstring';

@Injectable()
export class InstitutionService {
    constructor(
        @InjectRepository(InstitutionRepository)
        private institutionRepository: InstitutionRepository,
    ) { }

    async getAllInstitutions(
        paginationArgs: PaginationArgs,
        filter: InstitutionFilter,
    ): Promise<PaginatedInstitution> {
        const query = this.institutionRepository
            .createQueryBuilder()
            .select();

        if (filter.searchKeyword) {
            applySearchQuery(query, filter.searchKeyword, Institution.searchable);
        }

        return paginate(query, paginationArgs);
    }

    async createInstitution(input: InstitutionInput): Promise<Institution> {

        const institution = this.institutionRepository.create(input);

        if (!institution.code) {
            institution.code = randomstring.generate({
                length: 4,
                capitalization: 'uppercase',
            });
        }

        await this.institutionRepository.save(institution)

        return institution;
    }

    async updateInstitution(id: number, input: InstitutionUpdateInput): Promise<Institution> {

        const institution = await this.institutionRepository.findOneOrFail({ id });

        institution.name = input.name ?? institution.name;
        institution.type = input.type ?? institution.type;
        institution.code = input.code ?? institution.code;
        institution.address = input.address ?? institution.address;
        institution.email = input.email ?? institution.email;
        institution.phone = input.phone ?? institution.phone;
        institution.meta = input.meta ?? institution.meta;

        await this.institutionRepository.save(institution);

        return institution;
    }

    async deleteInstitution(id: number): Promise<boolean> {

        const result = await this.institutionRepository.softDelete(id);

        if (result.affected <= 0) {
            throw new NotFoundException();
        }

        return true;
    }
}
