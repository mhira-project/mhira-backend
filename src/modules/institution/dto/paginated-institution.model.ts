import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/types/paginated';
import { Institution } from '../models/institution.model';

@ObjectType()
export class PaginatedInstitution extends Paginated(Institution) { }
