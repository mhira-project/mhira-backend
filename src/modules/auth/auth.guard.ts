import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { AuthenticationError } from 'apollo-server-express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  protected readonly logger = new Logger(GqlAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    return super.canActivate(
      new ExecutionContextHost([req]),
    );
  }

  handleRequest(err: any, user: any) {

    if (err) {
      this.logger.error(`Auth Error! ${err.message}`);
      throw err;
    }

    if (!user) {
      this.logger.error('Auth Error! User not found');
      throw new AuthenticationError('Auth Error! User not found');
    }

    if (!user.active) {
      this.logger.error('Auth Error! User de-activated');
      throw new AuthenticationError('Auth Error! User de-activated, please contact your administrator.');
    }

    return user;
  }
}
