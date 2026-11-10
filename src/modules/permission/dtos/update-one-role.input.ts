import { UpdateOneInputType } from "@ptc-org/nestjs-query-graphql";
import { InputType } from "@nestjs/graphql";
import { RoleInput } from "./role.input";
import { Role } from '../models/role.model';

@InputType()
export class UpdateOneRoleInput extends UpdateOneInputType(Role, RoleInput) {

}
