import { Injectable, Logger } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AuthenticationError } from 'apollo-server-express';
import * as moment from 'moment';
import { authConfig } from 'src/config/auth.config';
import { User } from 'src/modules/user/models/user.model';
import { CacheService } from 'src/shared';
import { Str } from 'src/shared/helpers/string.helper';
import { JwtPayload } from '../jwt-payload.interface';
import { AccessToken } from '../models/access-token.model';

@Injectable()
export class AccessTokenService {
    constructor(
        private jwtService: JwtService,
        private cacheService: CacheService,
    ) {}

    async validateAccessToken(tokenId: string): Promise<User> {
        if (!tokenId)
            throw new AuthenticationError(
                'Authentication error! No access token provided.',
            );

        await this.validateTokenActivity(tokenId);

        const token = await AccessToken.findOne({
            where: {
                id: tokenId,
                isRevoked: false,
            },
            relations: ['user'],
        });

        if (token) {
            await this.setTokenActivity(tokenId);
        }

        if (!token || !token.user)
            throw new AuthenticationError('Session expired! Please login.');

        return token.user;
    }

    async revokeTokens(user: User): Promise<boolean> {
        Logger.debug('logging out!');
        const tokens = await AccessToken.find({ where: { userId: user.id } });

        for (const token of tokens) {
            await this.revokeTokenActivity(token.id);

            token.isRevoked = true;
            await token.save();
        }

        return tokens.length > 0;
    }

    async generateToken(user: User): Promise<string> {
        // Issue new token

        const tokenId = Str.uuid();
        const expiresIn = authConfig.tokenLife;
        const expiresAt = moment()
            .add(expiresIn, 'second')
            .toDate();

        const token = AccessToken.create({
            id: tokenId,
            userId: user.id,
            expiresAt: expiresAt,
        });

        await token.save();

        // Cache token
        await this.setTokenActivity(tokenId);

        // create signed JWT
        const payload: JwtPayload = {
            jti: tokenId,
            sub: `${user.id}`,
        };

        const options: JwtSignOptions = { expiresIn };

        const accessToken: string = await this.jwtService.sign(
            payload,
            options,
        );

        // return signed JWT
        return accessToken;
    }

    protected async setTokenActivity(tokenId: string): Promise<number> {
        const cacheKey = this.getTokenActivityCacheKey(tokenId);
        const inactivityTimeout = authConfig.inactivityTimeout;

        return this.cacheService
            .manager()
            .set(cacheKey, 1, { ttl: inactivityTimeout });
    }

    protected async revokeTokenActivity(tokenId: string): Promise<number> {
        const cacheKey = this.getTokenActivityCacheKey(tokenId);

        return this.cacheService.manager().del(cacheKey);
    }

    protected async validateTokenActivity(tokenId: string) {
        const cacheKey = this.getTokenActivityCacheKey(tokenId);
        const active = await this.cacheService.manager().get<number>(cacheKey);

        if (active !== 1) {
            throw new AuthenticationError('Session expired! Please login.');
        }
    }

    protected getTokenActivityCacheKey(tokenId: string) {
        return `active-sessions:${tokenId}`;
    }
}
