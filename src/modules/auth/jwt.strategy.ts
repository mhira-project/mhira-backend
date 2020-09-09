import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { JwtPayload } from './jwt-payload.interface';
import { UserService } from 'src/modules/user/providers/user.service';
import { User } from 'src/modules/user/models/institution-user.model';
import { AuthService } from './auth.service';
import { BaseUser } from '../user/models/base-user.model';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: JwtPayload): Promise<BaseUser> {
        const { id } = payload;
        const user = await this.authService.validateUserId(id);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
