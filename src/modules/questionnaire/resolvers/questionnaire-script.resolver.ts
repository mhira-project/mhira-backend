import {
    ConnectionType,
    CreateOneInputType,
} from '@nestjs-query/query-graphql';
import {
    Args,
    Mutation,
    Parent,
    ResolveField,
    Resolver,
    Query,
    InputType,
    Int,
    PartialType,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { User } from 'src/modules/user/models/user.model';
import {
    CreateQuestionnaireScriptInput,
    UpdateQuestionnaireScriptInput,
} from '../dtos/questionnaire-script.input';
import {
    QuestionnaireScriptConnection,
    QuestionnaireScriptQuery,
} from '../dtos/questionnaire-scripts.args';
import { QuestionnaireScript } from '../models/questionnaire-script.model';
import { QuestionnaireScriptService } from '../services/questionnaire-script.service';

@Resolver(() => QuestionnaireScript)
export class QuestionnaireScriptsResolver {
    constructor(
        private questionnaireScriptService: QuestionnaireScriptService,
    ) {}

    @Query(() => QuestionnaireScriptConnection)
    scripts(
        @Args({ type: () => QuestionnaireScriptQuery })
        query: QuestionnaireScriptQuery,
        @CurrentUser() currentUser: User,
    ): Promise<ConnectionType<QuestionnaireScript>> {
        return this.questionnaireScriptService.getQuestionnaireScripts(
            query,
            currentUser,
        );
    }

    @Mutation(() => QuestionnaireScript)
    createNewQuestionnaireScript(
        @Args('input') input: CreateQuestionnaireScriptInput,
    ): any {
        return this.questionnaireScriptService.createNewScript(input);
    }

    @Mutation(() => QuestionnaireScript)
    updateOneQuestionnaireScript(
        @Args('input') input: UpdateQuestionnaireScriptInput,
    ): Promise<QuestionnaireScript> {
        return this.questionnaireScriptService.updateQuestionnaireScripts(
            input,
        );
    }
}
