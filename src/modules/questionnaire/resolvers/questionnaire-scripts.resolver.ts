import {
    Args,
    Mutation,
    Parent,
    ResolveField,
    Resolver,
    Query,
} from '@nestjs/graphql';
import { QuestionnaireScriptsInput } from '../dtos/questionnaire-scripts.input';
import { QuestionnaireScripts } from '../models/questionnaire-scripts.schema';
import { Questionnaire } from '../models/questionnaire.schema';
import { QuestionnaireScriptsService } from '../services/questionnaire-scripts.service';

@Resolver(() => Questionnaire)
export class QuestionnaireScriptsResolver {
    constructor(
        private questionnaireScriptsService: QuestionnaireScriptsService,
    ) {}

    @Mutation(() => QuestionnaireScripts)
    createNewQuestionnaireScript(
        @Args('input') input: QuestionnaireScriptsInput,
    ): any {
        return this.questionnaireScriptsService.createNewScript(input);
    }
}
