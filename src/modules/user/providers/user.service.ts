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
import { UserUpdatePasswordInput } from '../dto/user-update-password.dto';
import { Hash } from 'src/shared/helpers/hash.helper';
import { ChangePasswordRequest } from 'src/modules/auth/dto/change-password-request.dto';
import { PaginationArgs } from 'src/shared/pagination/types/pagination.args';
import { UserFilter } from '../dto/user.filter';
import { UserConnectionDto } from '../dto/user-connection.model';
import { paginate } from 'src/shared/pagination/services/paginate';
import { applySearchQuery } from 'src/shared/helpers/search.helper';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInput } from '../dto/update-user.input';
import * as moment from 'moment';
import { UserPreviousPassword } from '../models/user-previous-password.model';
import { SettingService } from 'src/modules/setting/providers/setting.service';

@Injectable()
export class UserService {

    private readonly logger = new Logger('UserService');

    constructor(
        @InjectRepository(UserRepository) private readonly userRepository: UserRepository,
        private readonly setting: SettingService,
    ) { }


    async list(paginationArgs: PaginationArgs, filter: UserFilter): Promise<UserConnectionDto> {

        const query = this.userRepository
            .createQueryBuilder('user')
            .select();


        if (filter.searchKeyword) {
            applySearchQuery(query, filter.searchKeyword, User.searchable);
        }

        return paginate(query, paginationArgs);
    }

    getOne(id: number): Promise<User> {
        return this.userRepository.findOneOrFail({ id });
    }

    async createUser(userInput: CreateUserInput): Promise<User> {

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

        // set cutoff date to last 12 months
        const cutOffDays = await this.setting.getKey('passwordReUseCutoffInDays');

        const cutOffDate = moment().subtract(cutOffDays, 'days').format('YYYY-MM-DD');

        //check to see if password was once used in a 12months timeline.
        const prevPasswords = await UserPreviousPassword
            .createQueryBuilder('passwords')
            .where('passwords.userId = :userId', { userId: targetUser.id })
            .where('passwords.createdAt >= :cutOffDate', { cutOffDate })
            .getMany();

        for (const prevPassword of prevPasswords) {
            const isSamePassword = await Hash.compare(changePasswordRequest.newPassword, prevPassword.password);

            // throw exception if password recently used
            if (isSamePassword) {
                throw new BadRequestException(`Password was once used in the last ${cutOffDays} days! Please enter another password!`);
            }
        }

        // Save last password in previous passwords
        const prevPasswordInstance = UserPreviousPassword.create({
            password: targetUser.password,
            user: targetUser,
        });

        await prevPasswordInstance.save();

        // Update new password
        const hashedPassword = await Hash.make(changePasswordRequest.newPassword);
        targetUser.password = hashedPassword;

        // Set expiry date for new password
        const passwordLifeTime = await this.setting.getKey('passwordLifeTimeInDays');

        targetUser.passwordExpiresAt = moment().add(passwordLifeTime, 'days').toDate();

        // save password
        await targetUser.save();

        return true;
    }


    async updateUser(userId: number, input: UpdateUserInput) {

        const targetUser = await User.findOneOrFail({ id: userId });

        targetUser.username = input.username ?? targetUser.username;
        targetUser.active = input.active ?? targetUser.active;

        targetUser.firstName = input.firstName ?? targetUser.firstName;
        targetUser.middleName = input.middleName ?? targetUser.middleName;
        targetUser.lastName = input.lastName ?? targetUser.lastName;

        targetUser.email = input.email ?? targetUser.email;
        targetUser.phone = input.phone ?? targetUser.phone;
        targetUser.address = input.address ?? targetUser.address;

        targetUser.gender = input.gender ?? targetUser.gender;
        targetUser.nationality = input.nationality ?? targetUser.nationality;
        targetUser.birthDate = input.birthDate ?? targetUser.birthDate;

        targetUser.workID = input.workID ?? targetUser.workID;

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
