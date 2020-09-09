import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class UserTypeGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context);

        // Gets Anotations defined on method level
        const userTypesFromHandler = this.reflector.get<string[]>("userTypes", context.getHandler()) || [];

        // Gets Anotations defined on Controller/Resolver class level
        const userTypeFromClass = this.reflector.get<string[]>("userTypes", context.getClass()) || [];

        // merge all types defined
        const userTypes = userTypesFromHandler.concat(userTypeFromClass);

        // Get user
        const request = ctx.getContext().req;
        const user = request.user;

        if (user) {
            // Returns true if NO userTypes required OR user has any of required userTypes
            return userTypes.length === 0 || userTypes.includes(user.type);
        } else {
            return false;
        }
    }
}
