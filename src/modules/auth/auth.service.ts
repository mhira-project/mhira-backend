import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/modules/user/providers/user.service';
import { User } from 'src/modules/user/models/user.model';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoginRequestDto } from './dto/login-request.dto';
import { ChangePasswordRequest } from './dto/change-password-request.dto';
import { Validator } from 'src/shared/helpers/validator.helper';
import { Hash } from 'src/shared/helpers/hash.helper';
import { AccessToken } from './models/access-token.model';
import * as dayjs from 'dayjs';
import { authConfig } from 'src/config/auth.config';

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
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

        let user: User;

        // Find by Email
        if (Validator.isEmail(identifier)) {
            user = await User.findOne({ email: identifier });
        }
        // Find by Phone Number
        else if (Validator.isPhone(identifier)) {
            user = await User.findOne({ phone: identifier });
        }
        else {
            throw new UnauthorizedException('Invalid identifier provided! Identifier must be a VALID email or phone.');
        }

        if (user && (await Hash.compare(password, user.password))) {
            // valid password
            return user;
        } else {
            throw new UnauthorizedException('Invalid Credentials');
        }

    }

    async validateAccessToken(tokenId: string): Promise<User> {

        if (!tokenId) throw new NotFoundException('Invalid Token ID');

        const token = await AccessToken
            .findOne({
                where: {
                    id: tokenId,
                    isRevoked: false
                },
                relations: ['user']
            });

        if (!token) throw new UnauthorizedException();

        return token.user;
    }

    async changePassword(changePasswordRequest: ChangePasswordRequest, user: User): Promise<boolean> {

        return this.userService.changeOwnPassword(changePasswordRequest, user);

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
        await this.logout(user);

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
