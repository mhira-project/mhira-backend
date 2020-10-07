import { ObjectType } from '@nestjs/graphql';
import { Paginated } from 'src/shared/pagination/types/paginated';
import { User } from '../models/user.model';

@ObjectType()
export class UserConnectionDto extends Paginated(User) { }
