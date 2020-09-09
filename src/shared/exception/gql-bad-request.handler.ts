import { Catch, BadRequestException, HttpException, ArgumentsHost } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';


@Catch(BadRequestException)
export class GqlBadRequestHandler implements GqlExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const gqlHost = GqlArgumentsHost.create(host);

        const response = exception.getResponse();

        const message = typeof response['message'] === 'string'
            ? response['message']
            : response['message'][0];

        return new GraphQLError(message);
    }
}
