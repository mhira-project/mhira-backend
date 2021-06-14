import { UpdateOneInputType } from "@nestjs-query/query-graphql";
import { InputType } from "@nestjs/graphql";
import { UpdateUserInput } from "./update-user.input";
import { User } from '../models/user.model';

@InputType()
export class UpdateOneUserInput extends
    UpdateOneInputType(User, UpdateUserInput) {
}
