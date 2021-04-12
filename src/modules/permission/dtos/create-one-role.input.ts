import { CreateOneInputType } from "@nestjs-query/query-graphql";
import { InputType } from "@nestjs/graphql";
import { RoleInput } from "./role.input";

@InputType()
export class CreateOneRoleInput extends
    CreateOneInputType('role', RoleInput) {
}

