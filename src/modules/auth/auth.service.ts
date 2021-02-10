import { Injectable, Logger } from '@nestjs/common';
import { User } from 'src/modules/user/models/user.model';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoginRequestDto } from './dto/login-request.dto';
import { Hash } from 'src/shared/helpers/hash.helper';
import { AccessToken } from './models/access-token.model';
import * as dayjs from 'dayjs';
import { authConfig } from 'src/config/auth.config';
import { AuthenticationError } from 'apollo-server-express';
import { Permission } from '../permission/models/permission.model';
import { Any } from 'typeorm';
import { Role } from '../permission/models/role.model';

@Injectable()
export class AuthService {

    private readonly logger = new Logger('AuthService');

    constructor(
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
        const user = await this.validateUserCredentials(loginDto);

        const accessToken: string = await this.generateToken(user);

        const loginResponse = new LoginResponseDto();
        loginResponse.accessToken = accessToken;
        loginResponse.user = user;

        return loginResponse;
    }

    private async validateUserCredentials(loginDto: LoginRequestDto): Promise<User> {

        const { identifier, password } = loginDto;

        const user = await User.findOne({
            username: identifier,
            active: true,
        });

        // invalid username
        if (!user) {
            this.logger.debug(`Invalid Username: ${identifier}`);
            throw new AuthenticationError('Invalid Credentials');
        }

        // deactivated user
        if (!user.active) {
            this.logger.debug(`Deactivated User: ${identifier}`);
            throw new AuthenticationError('User deactivated. Contact your administrator for support!');
        }

        const verifyResult = await Hash.compare(password, user.password)

        // invalid password
        if (!verifyResult) {
            this.logger.debug(`Invalid Password for user: ${user.username}`);
            throw new AuthenticationError('Invalid Credentials');
        }

        return user;
    }

    async validateAccessToken(tokenId: string): Promise<User> {

        if (!tokenId) throw new AuthenticationError('Authentication error! No access token provided.');

        const token = await AccessToken
            .findOne({
                where: {
                    id: tokenId,
                    isRevoked: false
                },
                relations: ['user']
            });

        if (!token || !token.user) throw new AuthenticationError('Session expired! Please login.');

        return token.user;
    }

    async userPermissionGrants(userInput: User): Promise<Permission[]> {

        // re-select the user
        const user = await User.findOne({
            relations: ['permissions', 'roles'],
            where: { id: userInput.id },
        });

        const directPermissions = user.permissions;

        const roleIds = user.roles.map(role => role.id);

        const roles = await Role.find({
            relations: ['permissions'],
            where: { id: Any(roleIds) },
        });

        const rolePermissions = roles.flatMap(role => (role.permissions));

        const permissions = [...new Set([...directPermissions, ...rolePermissions])]

        return permissions;
    }

    async logout(user: User): Promise<boolean> {

        const result = await AccessToken.createQueryBuilder('access_token')
            .where("userId = :userId", { userId: user.id })
            .update({ isRevoked: true })
            .execute();

        return result.affected > 0;
    }

    private async generateToken(user: User): Promise<string> {

        // revoke all previous tokens
        // await this.logout(user);

        // Issue new token
        const token = new AccessToken;
        token.userId = user.id;
        token.expiresAt = dayjs().add(authConfig.tokenLife, 'second').toDate();
        await token.save();

        // create signed JWT
        const payload: JwtPayload = {
            jti: token.id,
            sub: `${user.id}`,
        };

        const options: JwtSignOptions = {
            expiresIn: authConfig.tokenLife,
        }

        const accessToken: string = await this.jwtService.sign(payload, options);

        // return signed JWT
        return accessToken;
    }
}
