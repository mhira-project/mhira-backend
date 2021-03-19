import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';
import { PermissionService } from '../providers/permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const ctx = GqlExecutionContext.create(context);

        // Gets Anotations defined on method level
        const permissionFromHandler = this.reflector.get<string[] | string>("permissions", context.getHandler()) || [];

        // Gets Anotations defined on Controller/Resolver class level
        const permissionFromClass = this.reflector.get<string[] | string>("permissions", context.getClass()) || [];

        // merge all types defined
        const permissions = [] as string[];

        if (typeof permissionFromHandler === 'string') {
            permissions.push(permissionFromHandler)
        } else {
            permissions.push(...permissionFromHandler);
        }

        if (permissionFromClass === 'string') {
            permissions.push(permissionFromClass)
        } else {
            permissions.push(...permissionFromClass);
        }

        const request = ctx.getContext().req;
        const user = request.user;


        if (!user) {
            // Return failure if un-authenticated request
            return false;
        }

        const permissionGrants = await PermissionService.userPermissionGrants(user.id);

        // Check each permission is available on User
        for (const permission of permissions) {
            const isFound = !!permissionGrants?.find(p => p.name === permission);

            // Return failure on first missing permission
            if (!isFound) throw new ForbiddenError(`Forbidden! Permission '${permission}' required to access this resource`);
        }

        return true;
    }
}
