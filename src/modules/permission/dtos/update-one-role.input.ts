import { UpdateOneInputType } from "@nestjs-query/query-graphql";
import { InputType } from "@nestjs/graphql";
import { RoleInput } from "./role.input";

@InputType()
export class UpdateOneRoleInput extends
    UpdateOneInputType(RoleInput) {
}
