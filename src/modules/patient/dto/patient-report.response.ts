import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType, Field } from '@nestjs/graphql';

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
class AnswerResult {
    @Field(() => [String], { nullable: true })
    multipleChoiceValue: string[];

    @Field(() => String, { nullable: true })
    questionId: string;

    @Field(() => Date, { nullable: true })
    dateValue: Date;

    @Field(() => Boolean, { nullable: true })
    valid: boolean;

    @Field(() => Date, { nullable: true })
    createdAt: Date;

    @Field(() => Date, { nullable: true })
    updatedAt: Date;

    @Field(() => String, { nullable: true })
    textValue: string;

    @Field(() => Date, { nullable: true })
    combinedDate: Date;

    @Field(() => Number, { nullable: true })
    numberValue: number;
}

@ObjectType()
class AnsweredQuestions {
    @Field(() => String, { nullable: true })
    variable: string;

    @Field(() => String, { nullable: true })
    label: string;

    @Field(() => String, { nullable: true })
    type: string;

    @Field(() => String, { nullable: true })
    hint: string;

    @Field(() => Boolean, { nullable: true })
    required: boolean;

    @Field(() => AnswerResult, { nullable: true })
    answer: AnswerResult;

    @Field(() => String, { nullable: true })
    questionGrouplabel: string;

    @Field(() => [QuestionnaireChoice], { nullable: true })
    choices: QuestionnaireChoice[];
}

@ObjectType()
export class AnsweredQuestionnaire {
    @Field(() => String, { nullable: true })
    assessmentId: string;

    @Field(() => String, { nullable: true })
    abbreviation: string;

    @Field(() => String, { nullable: true })
    _id: string;

    @FilterableField(() => String, { nullable: true })
    status: string;

    @Field(() => Date, { nullable: true })
    createdAt: Date;

    @Field(() => Date, { nullable: true })
    updatedAt: Date;

    @Field(() => String, { nullable: true })
    copyright: string;

    @Field(() => String, { nullable: true })
    language: string;

    @Field(() => String, { nullable: true })
    name: string;

    @Field(() => String, { nullable: true })
    description: string;

    @Field(() => String, { nullable: true })
    questionnaireFullName: string;

    @Field(() => [AnsweredQuestions], { nullable: true })
    questions: AnsweredQuestions[];
}
