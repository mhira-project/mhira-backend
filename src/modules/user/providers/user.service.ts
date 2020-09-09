import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { User } from '../models/institution-user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';
import { UserInput } from '../dto/user.input';
import { UserUpdateInput } from '../dto/user-update.dto';
import { UserUpdatePasswordInput } from '../dto/user-update-password.dto';
import { Hash } from 'src/shared/helpers/hash.helper';
import { ChangePasswordRequest } from 'src/modules/auth/dto/change-password-request.dto';
import { PaginationArgs } from 'src/shared/pagination/types/pagination.args';
import { UserFilter } from '../dto/user.filter';
import { PaginatedUser } from '../dto/paginated-user.model';
import { paginate } from 'src/shared/pagination/services/paginate';
import { BaseUser } from '../models/base-user.model';
import { Admin } from '../models/admin-user.model';
import { UserType } from '../models/user-type.enum';
import { applySearchQuery } from 'src/shared/helpers/search.helper';

@Injectable()
export class UserService {

    private readonly logger = new Logger('UserService');

    constructor(
        @InjectRepository(UserRepository) private userRepository: UserRepository,
    ) { }

    async getOwnInstitutionUsers(paginationArgs: PaginationArgs, filter: UserFilter, viewer: User): Promise<PaginatedUser> {

        return this.getInstitutionUsers(paginationArgs, filter, viewer.institutionId);
    }

    async getAdminUsers(paginationArgs: PaginationArgs, filter: UserFilter): Promise<PaginatedUser> {

        const query = Admin
            .createQueryBuilder('user')
            .select();

        if (filter.searchKeyword) {
            applySearchQuery(query, filter.searchKeyword, Admin.searchable);
        }

        return paginate(query, paginationArgs);
    }

    async getInstitutionUsers(paginationArgs: PaginationArgs, filter: UserFilter, institutionId: number = null): Promise<PaginatedUser> {

        const query = this.userRepository
            .createQueryBuilder('user')
            .select();

        // scope to institution
        if (institutionId) {
            query.where('user.institutionId = :institutionId', { institutionId });
        }


        if (filter.searchKeyword) {
            applySearchQuery(query, filter.searchKeyword, User.searchable);
        }

        return paginate(query, paginationArgs);
    }

    async createOwnInstitutionUser(userInput: UserInput, actor: User): Promise<User> {

        return this.createInstitutionUser(userInput, actor.institutionId);
    }

    async createInstitutionUser(userInput: UserInput, institutionId: number): Promise<User> {

        const user = this.userRepository.create(userInput);
        user.password = await Hash.make(userInput.password);
        user.institutionId = institutionId;

        return this.userRepository.save(user);
    }

    async changeOwnPassword(changePasswordRequest: ChangePasswordRequest, user: BaseUser): Promise<boolean> {

        const validateCurrentPassword = await Hash.compare(changePasswordRequest.currentPassword, user.password);

        // validate current password
        if (!validateCurrentPassword) {
            throw new UnauthorizedException('Invalid current password provided!');
        }

        return this.changePassword(changePasswordRequest, user, user);

    }

    async changeOwnInstitutionUserPassword(
        changePasswordRequest: UserUpdatePasswordInput,
        targetUserId: number,
        currentUser: User
    ): Promise<boolean> {

        const targetUser = await this.userRepository.findOneOrFail({
            id: targetUserId,
            institutionId: currentUser.institutionId
        });

        return this.changePassword(changePasswordRequest, targetUser, currentUser);
    }

    async changeAnyInstitutionUserPassword(
        changePasswordRequest: UserUpdatePasswordInput,
        targetUserId: number,
        currentUser: User
    ): Promise<boolean> {

        const targetUser = await User.findOneOrFail({
            id: targetUserId,
        });

        return this.changePassword(changePasswordRequest, targetUser, currentUser);
    }

    async changeAdminUserPassword(
        changePasswordRequest: UserUpdatePasswordInput,
        targetUserId: number,
        currentUser: User
    ): Promise<boolean> {

        const targetUser = await Admin.findOneOrFail({
            id: targetUserId,
        });

        return this.changePassword(changePasswordRequest, targetUser, currentUser);
    }

    private userCanUpdateUser(currentUser: BaseUser, targetUser: BaseUser): boolean {

        // User objects must be set
        if (!currentUser || !targetUser) {
            return false;
        }

        // Admin can update any user
        if (currentUser.type === UserType.ADMIN) {
            return true;
        }

        // Non-admins cannot update admin users
        if (targetUser.type === UserType.ADMIN) {
            return false;
        }

        // User can update only users of same institution
        return currentUser['institutionId'] === targetUser['institutionId'];
    }

    private async changePassword(changePasswordRequest: UserUpdatePasswordInput, targetUser: BaseUser, currentUser: BaseUser): Promise<boolean> {

        // Check currentUser role can update targetUser
        if (!this.userCanUpdateUser(currentUser, targetUser)) {
            throw new UnauthorizedException();
        }

        // Validate password confirmation
        if (changePasswordRequest.newPassword !== changePasswordRequest.newPasswordConfirmation) {
            throw new BadRequestException('Password confirmation mismatch! Provided password and password confirmation did not match.');
        }

        targetUser.password = await Hash.make(changePasswordRequest.newPassword);
        targetUser.save();

        return true;
    }

    async updateOwnInstitutionUser(targetUserId: number, input: UserUpdateInput, currentUser: BaseUser) {
        const targetUser = await this.userRepository.findOneOrFail({
            id: targetUserId,
            institutionId: currentUser['institutionId']
        });

        return this.updateUser(input, targetUser, currentUser)
    }

    async updateAnyInstitutionUser(targetUserId: number, input: UserUpdateInput, currentUser: BaseUser) {
        const targetUser = await this.userRepository.findOneOrFail({
            id: targetUserId,
        });

        return this.updateUser(input, targetUser, currentUser)
    }

    // async updateAdminUser(targetUserId: number, input: UserUpdateInput, currentUser: BaseUser) {
    //     const targetUser = await Admin.findOneOrFail({
    //         id: targetUserId,
    //     });

    //     return this.updateUser(input, targetUser, currentUser)
    // }

    private async updateUser(input: UserUpdateInput, targetUser: BaseUser, currentUser: BaseUser) {

        // Check currentUser can update targetUser
        if (!this.userCanUpdateUser(currentUser, targetUser)) {
            throw new UnauthorizedException();
        }

        targetUser.email = input.email ?? targetUser.email;
        targetUser.phone = input.phone ?? targetUser.phone;
        targetUser.name = input.name ?? targetUser.name;

        return this.userRepository.save(targetUser)
    }

    async deleteOwnInstitutionUser(targetUserId: number, currentUser: BaseUser): Promise<boolean> {
        const targetUser = await this.userRepository.findOneOrFail({
            id: targetUserId,
            institutionId: currentUser['institutionId'],
        });

        return this.deleteUser(targetUser, currentUser);
    }

    async deleteAnyInstitutionUser(targetUserId: number, currentUser: BaseUser): Promise<boolean> {
        const targetUser = await this.userRepository.findOneOrFail({
            id: targetUserId,
        });

        this.logger.verbose(targetUser);
        return this.deleteUser(targetUser, currentUser);
    }

    private async deleteUser(targetUser: BaseUser, currentUser: BaseUser): Promise<boolean> {

        // Check currentUser can update targetUser
        if (!this.userCanUpdateUser(currentUser, targetUser)) {
            throw new UnauthorizedException();
        }

        const result = await this.userRepository
            .createQueryBuilder('user')
            .where('"user"."id" = :userId', { userId: targetUser.id })
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
