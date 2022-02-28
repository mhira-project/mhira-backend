import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class QuestionnaireScriptsArgs {
    @Field(() => String)
    id: string;
}
