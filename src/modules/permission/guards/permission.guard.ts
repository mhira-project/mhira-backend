import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context);
        const permission = this.reflector.get<string>("permissions", context.getHandler()) || [];
        const request = ctx.getContext().req;
        const user = request.user;

        if (user && user.role) {
            const foundPermission = user.role.permissions.find((p) => p.name === permission);
            if (foundPermission) {
                return true;
            } else {
                return false
            }
        } else {
            return false
        }
    }
}
