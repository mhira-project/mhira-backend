import { DeleteOneInputType } from "@nestjs-query/query-graphql";
import { InputType } from "@nestjs/graphql";

@InputType()
export class DeleteOneRoleInput extends DeleteOneInputType() {

}

