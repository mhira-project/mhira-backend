import { ArgsType, InputType } from '@nestjs/graphql';
import {
    MutationArgsType,
    RelationsInputType,
} from '@ptc-org/nestjs-query-graphql';
import { Department } from 'src/modules/department/models/department.model';
import { Role } from 'src/modules/permission/models/role.model';
import { User } from '../models/user.model';

// The inputs of the add… and remove… mutations of a user's roles and
// departments, built as the fork builds those of a generated relation
// mutation.

@InputType()
export class AddRolesToUserInput extends RelationsInputType(User, Role) {}

@ArgsType()
export class AddRolesToUserArgs extends MutationArgsType(AddRolesToUserInput) {}

@InputType()
export class RemoveRolesFromUserInput extends RelationsInputType(User, Role) {}

@ArgsType()
export class RemoveRolesFromUserArgs extends MutationArgsType(
    RemoveRolesFromUserInput,
) {}

@InputType()
export class AddDepartmentsToUserInput extends RelationsInputType(
    User,
    Department,
) {}

@ArgsType()
export class AddDepartmentsToUserArgs extends MutationArgsType(
    AddDepartmentsToUserInput,
) {}

@InputType()
export class RemoveDepartmentsFromUserInput extends RelationsInputType(
    User,
    Department,
) {}

@ArgsType()
export class RemoveDepartmentsFromUserArgs extends MutationArgsType(
    RemoveDepartmentsFromUserInput,
) {}
