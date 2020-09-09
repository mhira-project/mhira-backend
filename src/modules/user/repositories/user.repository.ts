import { Repository, EntityRepository } from 'typeorm';
import { User } from '../models/institution-user.model';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

}
