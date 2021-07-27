import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';
import { User } from 'src/modules/user/models/user.model';

@Injectable()
export class RoleTypeGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);

        // Gets Anotations defined on method level
        const userTypesFromHandler =
            this.reflector.get<string[] | string>(
                'userTypes',
                context.getHandler(),
            ) || [];

        // Gets Anotations defined on Controller/Resolver class level
        const userTypeFromClass =
            this.reflector.get<string[] | string>(
                'userTypes',
                context.getClass(),
            ) || [];

        // merge all types defined
        const userTypes = [] as string[];

        if (typeof userTypesFromHandler === 'string') {
            userTypes.push(userTypesFromHandler);
        } else {
            userTypes.push(...userTypesFromHandler);
        }

        if (userTypeFromClass === 'string') {
            userTypes.push(userTypeFromClass);
        } else {
            userTypes.push(...userTypeFromClass);
        }

        if (userTypes.length === 0) return true; // pass due to no specific requirement on user type

        // Get user
        const request = ctx.getContext().req;
        const user = request.user;

        if (!user) {
            throw new ForbiddenError('Unauthenticated request!');
        }

        // Refetch user model with roles relation
        const userModel = await User.findOne({
            relations: ['roles'],
            where: { id: user.id },
        });

        // Check each permission is available on User
        for (const roleType of userTypes) {
            // Return failure on first missing permission
            if (!userModel.roles?.find(p => p.code === roleType))
                throw new ForbiddenError(
                    `Forbidden! Role type '${roleType.toUpperCase()}' required to access this resource`,
                );
        }

        return true;
    }
}
