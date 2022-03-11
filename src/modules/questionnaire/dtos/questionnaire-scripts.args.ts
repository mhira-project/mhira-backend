import { QueryArgsType, Relation } from '@nestjs-query/query-graphql';
import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import { QuestionnaireScript } from '../models/questionnaire-script.model';

@ArgsType()
export class QuestionnaireScriptQuery extends QueryArgsType(
    QuestionnaireScript,
) {
    @Field(() => String)
    questionnaireId: string;
}

export const QuestionnaireScriptConnection =
    QuestionnaireScriptQuery.ConnectionType;
