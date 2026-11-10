import { DeleteOneInputType } from "@ptc-org/nestjs-query-graphql";
import { InputType } from "@nestjs/graphql";
import { Role } from '../models/role.model';

@InputType()
export class DeleteOneRoleInput extends DeleteOneInputType(Role) {

}

