import { CreateOneInputType } from '@nestjs-query/query-graphql';
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
import {
    CreateQuestionnaireScriptInput,
    UpdateQuestionnaireScriptInput,
} from '../dtos/questionnaire-script.input';
import { QuestionnaireScriptsArgs } from '../dtos/questionnaire-scripts.args';
import { QuestionnaireScript } from '../models/questionnaire-script.model';
import { QuestionnaireScriptService } from '../services/questionnaire-script.service';

// @InputType()
// export class UpdateQuestionnaireScriptInput extends PartialType(
//     QuestionnaireScript,
// ) {}

@Resolver(() => QuestionnaireScript)
export class QuestionnaireScriptsResolver {
    constructor(
        private questionnaireScriptService: QuestionnaireScriptService,
    ) {}

    @Query(() => [QuestionnaireScript])
    getQuestionnaireScripts(
        @Args() questionnaireId: QuestionnaireScriptsArgs,
    ): Promise<QuestionnaireScript[]> {
        return this.questionnaireScriptService.findQuestionnaireScripts(1);
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
