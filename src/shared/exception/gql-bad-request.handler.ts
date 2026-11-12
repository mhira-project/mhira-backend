import {
    ArgumentsHost,
    Catch,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { GqlContextType, GqlExceptionFilter } from '@nestjs/graphql';
import { UserInputError } from './graphql-errors';


@Catch(BadRequestException)
export class GqlBadRequestHandler implements GqlExceptionFilter {
    private readonly logger = new Logger(GqlBadRequestHandler.name);

    catch(exception: BadRequestException, host: ArgumentsHost) {
        // A request whose JSON body does not parse never reaches GraphQL:
        // Nest hands the parser's error here as a BadRequestException.
        // v1.1.6 threw the GraphQL error below for it too; nothing caught
        // it, so the request never got an answer (B62), and from Node 15
        // until Express 5 (step 21) the rejection ended the process.
        // Express 5 catches it and would answer 500, which is neither
        // v1.1.6's behaviour nor B62's fix (a 400, ticket 12's), so the
        // request is logged and left unanswered as v1.1.6 leaves it. The
        // parser's message is not logged: from Node 20 on it quotes the
        // body it could not parse.
        if (host.getType<GqlContextType>() !== 'graphql') {
            this.logger.error(
                'A request body that does not parse, refused before GraphQL and left unanswered as v1.1.6 leaves it (B62)',
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
