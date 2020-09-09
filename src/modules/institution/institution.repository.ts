import { Institution } from './models/institution.model';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { Repository } from 'typeorm';

@EntityRepository(Institution)
export class InstitutionRepository extends Repository<Institution> { }
