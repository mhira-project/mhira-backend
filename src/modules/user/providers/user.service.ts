import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { User } from '../models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';
import { UserInput } from '../dto/user.input';
import { UserUpdateInput } from '../dto/user-update.dto';
import { UserUpdatePasswordInput } from '../dto/user-update-password.dto';
import { Hash } from 'src/shared/helpers/hash.helper';
import { ChangePasswordRequest } from 'src/modules/auth/dto/change-password-request.dto';
import { PaginationArgs } from 'src/shared/pagination/types/pagination.args';
import { UserFilter } from '../dto/user.filter';
import { UserConnection } from '../dto/user-connection.model';
import { paginate } from 'src/shared/pagination/services/paginate';
import { applySearchQuery } from 'src/shared/helpers/search.helper';

@Injectable()
export class UserService {

    private readonly logger = new Logger('UserService');

    constructor(
        @InjectRepository(UserRepository) private userRepository: UserRepository,
    ) { }


    async listUsers(paginationArgs: PaginationArgs, filter: UserFilter): Promise<UserConnection> {

        const query = this.userRepository
            .createQueryBuilder('user')
            .select();


        if (filter.searchKeyword) {
            applySearchQuery(query, filter.searchKeyword, User.searchable);
        }

        return paginate(query, paginationArgs);
    }

    async createUser(userInput: UserInput): Promise<User> {

        const user = this.userRepository.create(userInput);
        user.password = await Hash.make(userInput.password);

        return this.userRepository.save(user);
    }

    async changeOwnPassword(changePasswordRequest: ChangePasswordRequest, user: User): Promise<boolean> {

        const validateCurrentPassword = await Hash.compare(changePasswordRequest.currentPassword, user.password);

        // validate current password
        if (!validateCurrentPassword) {
            throw new UnauthorizedException('Invalid current password provided!');
        }

        return this.changePassword(changePasswordRequest, user);

    }

    async changePassword(changePasswordRequest: UserUpdatePasswordInput, targetUser: User | number): Promise<boolean> {

        if (typeof targetUser === 'number') {
            targetUser = await User.findOneOrFail(targetUser);
        }

        // Validate password confirmation
        if (changePasswordRequest.newPassword !== changePasswordRequest.newPasswordConfirmation) {
            throw new BadRequestException('Password confirmation mismatch! Provided password and password confirmation did not match.');
        }

        targetUser.password = await Hash.make(changePasswordRequest.newPassword);
        targetUser.save();

        return true;
    }


    async updateUser(userId: number, input: UserUpdateInput) {

        const targetUser = await User.findOneOrFail({ id: userId });
        targetUser.email = input.email ?? targetUser.email;
        targetUser.phone = input.phone ?? targetUser.phone;
        targetUser.name = input.name ?? targetUser.name;

        return this.userRepository.save(targetUser);
    }

    async deleteUser(userId: number): Promise<boolean> {

        const result = await this.userRepository
            .createQueryBuilder('user')
            .where('"user"."id" = :userId', { userId })
            .softDelete()
            .execute();

        if (result.affected <= 0) {
            throw new NotFoundException();
        }

        return true;
    }

    async userExists(phone: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ phone });
        if (user) return true;
        else return false;
    }

}
