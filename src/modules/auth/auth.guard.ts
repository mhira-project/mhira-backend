import { Injectable, CanActivate, ExecutionContext, Scope } from '@nestjs/common';
import { AccessTokenService } from './providers/access-token.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable({ scope: Scope.REQUEST }) // this is specifically needed because we get verifyAsync error 
export class GqlAuthGuard implements CanActivate {
    constructor(private readonly accessTokenService: AccessTokenService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        const token = this.extractTokenFromHeader(req);

        if (!token) {
            return false;
        }

        const payload = await this.accessTokenService.validateAccessToken(token);
        if (!payload) {
            return false;
        }

        req.user = payload;
        return true;
    }

    private extractTokenFromHeader(request): string | null {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : null;
    }
}