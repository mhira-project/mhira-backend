import { Catch, HttpException, ArgumentsHost, UnauthorizedException, Logger } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';

@Catch(UnauthorizedException)
export class GqlUnauthorizedHandler implements GqlExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const gqlHost = GqlArgumentsHost.create(host);

        const response = exception.getResponse();

        const message = typeof response['message'] === 'string'
            ? response['message']
            : response['message'][0];

        throw new ForbiddenError(message);
    }
}
