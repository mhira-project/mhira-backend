import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/modules/user/providers/user.service';
import { BaseUser as User, BaseUser } from 'src/modules/user/models/base-user.model';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto } from './dto/login-request.dto';
import { ChangePasswordRequest } from './dto/change-password-request.dto';
import { Validator } from 'src/shared/helpers/validator.helper';
import { Hash } from 'src/shared/helpers/hash.helper';

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

        Logger.verbose(user);
        return loginResponse;
    }

    private async validateUserCredentials(loginDto: LoginRequestDto): Promise<User> {

        const { identifier, password } = loginDto;

        let user: User;

        // Find by Email
        if (Validator.isEmail(identifier)) {
            user = await BaseUser.findOne({ email: identifier });
        }
        // Find by Phone Number
        else if (Validator.isPhone(identifier)) {
            user = await BaseUser.findOne({ phone: identifier });
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

    async validateUserId(id: number): Promise<User> {
        if (!id) throw new NotFoundException('Invalid ID');

        const user = await BaseUser.findOne({ id });
        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }


    async changePassword(changePasswordRequest: ChangePasswordRequest, user: User): Promise<boolean> {

        return this.userService.changeOwnPassword(changePasswordRequest, user);

    }

    private async generateToken(user: User): Promise<string> {
        const payload: JwtPayload = {
            id: user.id,
            name: user.name,
            createdAt: user.createdAt,
            role: 'USER',
        };
        const accessToken: string = await this.jwtService.sign(payload);

        return accessToken;
    }
}
