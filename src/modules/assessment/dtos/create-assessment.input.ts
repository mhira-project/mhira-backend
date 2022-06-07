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

    @Field(() => Int)
    assessmentTypeId: number;

    @FilterableField(() => Int, { nullable: true })
    clinicianId: number;

    @FilterableField(() => Int, { nullable: true })
    informantId?: number;
}

@InputType()
export class CreateFullAssessmentInput {
    @Field(() => Int)
    assessmentTypeId: number;

    @Field(() => Int)
    patientId: number;

    @Field(() => Int)
    clinicianId: number;

    @Field(() => String)
    informantType: string;

    @Field(() => String, { nullable: true })
    note: string;

    @Field(() => Int, { nullable: true })
    informantClinicianId?: number;

    @Field(() => String, { nullable: true })
    informantCaregiverRelation?: string;

    @Field(() => [String])
    @ArrayNotEmpty()
    questionnaires: Types.ObjectId[];

    @Field(() => GraphQLISODateTime, { nullable: true })
    expirationDate: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    deliveryDate: Date;
}

@InputType()
export class UpdateFullAssessmentInput extends CreateFullAssessmentInput {
    @Field(() => Int)
    assessmentId: number;

    @Field(() => GraphQLISODateTime, { nullable: true })
    expirationDate: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    deliveryDate: Date;
}
