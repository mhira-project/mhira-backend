import { ConnectionType } from '@nestjs-query/query-graphql';
import { UseGuards } from '@nestjs/common';
import {
    Args,
    Mutation,
    Resolver,
    Query,
    PartialType,
    ObjectType,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { User } from 'src/modules/user/models/user.model';
import {
    CreateQuestionnaireScriptInput,
    DeleteQuestionnaireScriptInput,
    UpdateQuestionnaireScriptInput,
} from '../dtos/questionnaire-script.input';
import {
    QuestionnaireScriptConnection,
    QuestionnaireScriptQuery,
} from '../dtos/questionnaire-scripts.args';
import { QuestionnaireScript } from '../models/questionnaire-script.model';
import { QuestionnaireScriptService } from '../services/questionnaire-script.service';

@ObjectType()
class QuestionnaireScriptDeleteResponse extends PartialType(
    QuestionnaireScript,
) {}

@Resolver(() => QuestionnaireScript)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class QuestionnaireScriptsResolver {
    constructor(
        private questionnaireScriptService: QuestionnaireScriptService,
    ) {}

    @Query(() => QuestionnaireScriptConnection)
    @UsePermission(PermissionEnum.VIEW_QUESTIONNAIRES)
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
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    createNewQuestionnaireScript(
        @Args('input') input: CreateQuestionnaireScriptInput,
    ): any {
        return this.questionnaireScriptService.createNewScript(input);
    }

    @Mutation(() => QuestionnaireScript)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    updateOneQuestionnaireScript(
        @Args('input') input: UpdateQuestionnaireScriptInput,
    ): Promise<QuestionnaireScript> {
        return this.questionnaireScriptService.updateQuestionnaireScripts(
            input,
        );
    }

    @Mutation(() => QuestionnaireScriptDeleteResponse)
    @UsePermission(PermissionEnum.MANAGE_QUESTIONNAIRES)
    deleteOneQuestionnaireScript(
        @Args('input') input: DeleteQuestionnaireScriptInput,
    ): Promise<any> {
        return this.questionnaireScriptService.delete(input);
    }
}
