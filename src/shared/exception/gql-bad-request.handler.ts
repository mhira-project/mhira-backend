import { Catch, BadRequestException, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-express';


@Catch(BadRequestException)
export class GqlBadRequestHandler implements GqlExceptionFilter {
    catch(exception: HttpException) {
        const response = exception.getResponse();
        const message: string = typeof response['message'] === 'string'
            ? response['message']
            : response['message'][0];

        // remove the `input.` prefix from validation messages
        const formattedMessage = message.replace('input.', '');

        throw new UserInputError(formattedMessage, { messages: response['message'] })
    }
}
