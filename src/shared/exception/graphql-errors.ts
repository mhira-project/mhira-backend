import { GraphQLError } from 'graphql';

/**
 * The three Apollo Server 3 error classes MHIRA throws, which Apollo Server
 * 4 no longer ships: a GraphQLError with the same `extensions.code`, and
 * the extensions a caller adds before it, as Apollo 3's ApolloError built
 * them. Classes rather than plain GraphQLErrors because the answer path
 * tells its own validation errors apart with `instanceof UserInputError`.
 *
 */
abstract class GraphQLErrorWithCode extends GraphQLError {
    protected constructor(
        message: string,
        code: string,
        extensions?: Record<string, unknown>,
    ) {
        super(message, { extensions: { ...extensions, code } });
        // Apollo 3's classes named themselves, which logs and stack traces show.
        this.name = new.target.name;
    }
}

export class UserInputError extends GraphQLErrorWithCode {
    constructor(message: string, extensions?: Record<string, unknown>) {
        super(message, 'BAD_USER_INPUT', extensions);
    }
}

export class AuthenticationError extends GraphQLErrorWithCode {
    constructor(message: string) {
        super(message, 'UNAUTHENTICATED');
    }
}

export class ForbiddenError extends GraphQLErrorWithCode {
    constructor(message: string) {
        super(message, 'FORBIDDEN');
    }
}
