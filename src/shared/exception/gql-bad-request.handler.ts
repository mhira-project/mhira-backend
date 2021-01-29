import { Catch, BadRequestException, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-express';


@Catch(BadRequestException)
export class GqlBadRequestHandler implements GqlExceptionFilter {
    catch(exception: HttpException) {
        const response = exception.getResponse();
        const message = typeof response['message'] === 'string'
            ? response['message']
            : response['message'][0];

        throw new UserInputError(message, { messages: response['message'] })
    }
}
