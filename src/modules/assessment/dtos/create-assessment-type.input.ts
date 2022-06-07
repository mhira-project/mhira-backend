import { FilterableField } from '@nestjs-query/query-graphql';
import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import { ArrayNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class CreateAssessmentTypeInput {
    @FilterableField(() => String)
    name: string;
}

@InputType()
export class UpdateAssessmentTypeInput {
    @Field(() => Int)
    assessmentTypeId: number;

    @FilterableField(() => String)
    name: string;
}
