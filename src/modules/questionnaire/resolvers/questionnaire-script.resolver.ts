import {
    Args,
    Mutation,
    Parent,
    ResolveField,
    Resolver,
    Query,
} from '@nestjs/graphql';
import { QuestionnaireScriptInput } from '../dtos/questionnaire-script.input';
import { QuestionnaireScript } from '../models/questionnaire-script.model';
import { QuestionnaireScriptService } from '../services/questionnaire-script.service';

@Resolver(() => QuestionnaireScript)
export class QuestionnaireScriptsResolver {
    constructor(
        private questionnaireScriptService: QuestionnaireScriptService,
    ) {}

    @Mutation(() => QuestionnaireScript)
    createNewQuestionnaireScript(
        @Args('input') input: QuestionnaireScriptInput,
    ): any {
        return this.questionnaireScriptService.createNewScript(input);
    }
}
