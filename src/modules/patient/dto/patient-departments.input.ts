import { ArgsType, InputType } from '@nestjs/graphql';
import {
    MutationArgsType,
    RelationsInputType,
} from '@ptc-org/nestjs-query-graphql';
import { Department } from 'src/modules/department/models/department.model';
import { Patient } from '../models/patient.model';

// The inputs of addDepartmentsToPatient and removeDepartmentsFromPatient,
// built as the fork builds those of a generated relation mutation.

@InputType()
export class AddDepartmentsToPatientInput extends RelationsInputType(
    Patient,
    Department,
) {}

@ArgsType()
export class AddDepartmentsToPatientArgs extends MutationArgsType(
    AddDepartmentsToPatientInput,
) {}

@InputType()
export class RemoveDepartmentsFromPatientInput extends RelationsInputType(
    Patient,
    Department,
) {}

@ArgsType()
export class RemoveDepartmentsFromPatientArgs extends MutationArgsType(
    RemoveDepartmentsFromPatientInput,
) {}
