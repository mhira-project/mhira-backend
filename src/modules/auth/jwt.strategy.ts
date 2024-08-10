import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { JwtPayload } from './jwt-payload.interface';
import { AuthService } from './auth.service';
import { User } from '../user/models/user.model';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private authService: AuthService;

    constructor(
        private moduleRef: ModuleRef,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: any): Promise<Partial<User>> {
        const { jti } = payload;
        const contextId = ContextIdFactory.getByRequest(request);

        this.authService = await this.moduleRef.resolve(AuthService, contextId);

        try {
            const user = await this.authService.validateAccessToken(jti);
            console.log('here')
            if (!user) {
                throw new UnauthorizedException();
            }
            return user;
        } catch (error) {
            console.error('Error validating access token:', error);
            throw new UnauthorizedException();
        }
    }
}
