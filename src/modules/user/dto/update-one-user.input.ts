import { UpdateOneInputType } from "@nestjs-query/query-graphql";
import { InputType } from "@nestjs/graphql";
import { UpdateUserInput } from "./update-user.input";

@InputType()
export class UpdateOneUserInput extends
    UpdateOneInputType(UpdateUserInput) {
}
