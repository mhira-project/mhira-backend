import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';

@ArgsType()
export class QuestionnaireScriptsArgs {
    @Field(() => Int)
    questionnaireId: number;
}
