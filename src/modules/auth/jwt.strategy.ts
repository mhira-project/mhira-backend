import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { JwtPayload } from './jwt-payload.interface';
import { AuthService } from './auth.service';
import { User } from '../user/models/user.model';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    private readonly logger = new Logger('JwtStrategy');

    constructor(
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: JwtPayload): Promise<User> {

        this.logger.verbose(payload);
        const { jti } = payload;
        const user = await this.authService.validateAccessToken(jti);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
