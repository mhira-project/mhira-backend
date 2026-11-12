import {
    ArgumentsHost,
    Catch,
    BadRequestException,
    HttpException,
    Logger,
} from '@nestjs/common';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';
import { UserInputError } from './graphql-errors';


@Catch(BadRequestException)
export class GqlBadRequestHandler implements GqlExceptionFilter {
    private readonly logger = new Logger(GqlBadRequestHandler.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        // A request whose JSON body does not parse never reaches GraphQL:
        // Nest hands Express's error here as a BadRequestException. v1.1.6
        // threw the GraphQL error below for it too; nothing caught it, Node
        // 14 printed an unhandled rejection warning and the request never got
        // an answer (B62). From Node 15 on that rejection ends the process,
        // so it is logged instead and the request still gets no answer. A
        // runtime adaptation like B02's and B52's, not the fix of B62.
        if (host.getType<GqlContextType>() !== 'graphql') {
            this.logger.error(
                `${exception.message}: a request refused before GraphQL, left unanswered as v1.1.6 leaves it (B62)`,
            );
            return;
        }

        const response = exception.getResponse();
        const message: string = typeof response['message'] === 'string'
            ? response['message']
            : response['message'][0];

        // remove the `input.` prefix from validation messages
        const formattedMessage = message.replace('input.', '');

        throw new UserInputError(formattedMessage, { messages: response['message'] })
    }
}
