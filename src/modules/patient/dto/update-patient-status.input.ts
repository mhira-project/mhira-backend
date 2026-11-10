import { InputType, PartialType } from '@nestjs/graphql';
import { CreatePatientInput } from './create-patient.input';
import { Field, ObjectType } from '@nestjs/graphql';
import { CreateOneInputType } from '@ptc-org/nestjs-query-graphql';

@InputType()
export class CreatePatientStatus {
    @Field(() => String)
    name: string;

    @Field(() => String, { nullable: true })
    description: string;
}

@InputType()
export class CreateOnePatientStatusInput extends CreateOneInputType(
    'patientStatus',
    CreatePatientStatus,
) {}
