import { Catch, HttpException, UnauthorizedException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { ForbiddenError } from 'apollo-server-express';

@Catch(UnauthorizedException)
export class GqlUnauthorizedHandler implements GqlExceptionFilter {
    catch(exception: HttpException) {
        const response = exception.getResponse();
        const message = typeof response['message'] === 'string'
            ? response['message']
            : response['message'][0];

        throw new ForbiddenError(message);
    }
}
