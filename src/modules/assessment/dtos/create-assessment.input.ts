import { FilterableField } from '@nestjs-query/query-graphql';
import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import { ArrayNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class CreateAssessmentInput {
    @FilterableField(() => Int)
    patientId: number;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    date?: Date;

    @Field({ nullable: true })
    name: string;

    @FilterableField(() => Int, { nullable: true })
    clinicianId: number;

    @FilterableField(() => Int, { nullable: true })
    informantId?: number;
}

@InputType()
export class CreateFullAssessmentInput {
    @Field(() => String)
    name: string;

    @Field(() => Int)
    patientId: number;

    @Field(() => Int)
    clinicianId: number;

    @Field(() => String)
    informant: string;

    @Field(() => [String])
    @ArrayNotEmpty()
    questionnaires: Types.ObjectId[];
}

@InputType()
export class UpdateFullAssessmentInput extends CreateFullAssessmentInput {
    @Field(() => Int)
    assessmentId: number;
}
