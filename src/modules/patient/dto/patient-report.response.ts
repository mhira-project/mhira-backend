import { FilterableField } from "@nestjs-query/query-graphql";
import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class QuestionnaireChoice {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    label: string;

    @Field(() => String)
    name: string;
}

@ObjectType()
class AnswerChoiceLabel {
    @Field(() => String)
    label: string;

    @Field(() => String)
    name: string
}

@ObjectType()
class AnsweredQuestions {
    @Field(() => String)
    answerValue: string;

    @Field(() => [AnswerChoiceLabel])
    answerChoiceLabel: AnswerChoiceLabel[];

    @Field(() => String)
    createdAt: string;

    @Field(() => String)
    updatedAt: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    label: string;

    @Field(() => String)
    type: string;

    @Field(() => String)
    hint: string;

    @Field(() => Boolean)
    required: boolean;
}

@ObjectType()
export class AnsweredQuestionnaire {
    @Field(() => String)
    assessmentId: string;

    @Field(() => String)
    _id: string;

    @FilterableField()
    status: string;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => String)
    copyright: string;

    @Field(() => String)
    language: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    questionnaireFullName: string;

    @Field(() => [QuestionnaireChoice])
    choices: QuestionnaireChoice[];

    @Field(() => [AnsweredQuestions])
    answeredQuestions: AnsweredQuestions[];
}

