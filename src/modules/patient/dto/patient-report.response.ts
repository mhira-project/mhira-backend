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
    @Field(() => String, { nullable: true })
    answerValue: string;

    @Field(() => [AnswerChoiceLabel], { nullable: true })
    answerChoiceLabel: AnswerChoiceLabel[];

    @Field(() => String, { nullable: true })
    createdAt: string;

    @Field(() => String, { nullable: true })
    updatedAt: string;

    @Field(() => String, { nullable: true })
    name: string;

    @Field(() => String, { nullable: true })
    label: string;

    @Field(() => String, { nullable: true })
    type: string;

    @Field(() => String, { nullable: true })
    hint: string;

    @Field(() => Boolean, { nullable: true })
    required: boolean;
}

@ObjectType()
export class AnsweredQuestionnaire {
    @Field(() => String, { nullable: true })
    assessmentId: string;

    @Field(() => String, { nullable: true })
    _id: string;

    @FilterableField(() => String, { nullable: true })
    status: string;

    @Field(() => Date, { nullable: true })
    createdAt: Date;

    @Field(() => String, { nullable: true })
    copyright: string;

    @Field(() => String, { nullable: true })
    language: string;

    @Field(() => String, { nullable: true })
    name: string;

    @Field(() => String, { nullable: true })
    questionnaireFullName: string;

    @Field(() => [QuestionnaireChoice], { nullable: true })
    choices: QuestionnaireChoice[];

    @Field(() => [AnsweredQuestions], { nullable: true })
    answeredQuestions: AnsweredQuestions[];
}

