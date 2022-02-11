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

        const userId = GqlExecutionContext.create(context)?.getContext()?.req?.user?.id;
        // Return failure if un-authenticated request
        if (!userId) return false;

        // get permissions of user
        const permissionGrants = await PermissionService.userPermissionGrants(userId);

        // Check each required permission is available on User
        // Return failure on first missing permission
        const permissions = this.getPermissions(context, 'permissions');
        for (const permission of permissions) {
            if (permissionGrants.find(p => p.name === permission)) continue;
            throw new ForbiddenError(`Forbidden! Permission '${permission}' required to access this resource`);
        }

        // Check if one of the or_permissions is available on User
        const orPermissions = this.getPermissions(context, 'or_permissions');
        if (orPermissions.length && !orPermissions.some(p => permissionGrants.find(pg => pg.name === p))) {
            throw new ForbiddenError(`Forbidden! At least one of the permissions '${orPermissions.join(', ')}' is required to access this resource`);
        }

        return true;
    }

    private getPermissions(context: ExecutionContext, type: 'permissions' | 'or_permissions'): string[] {
        return [
            // Gets Anotations defined on method level
            this.reflector.get<string[] | string>(type, context.getHandler()) ?? [],

            // Gets Anotations defined on Controller/Resolver class level
            this.reflector.get<string[] | string>(type, context.getClass()) ?? [],
        ].flat();
    }
}
