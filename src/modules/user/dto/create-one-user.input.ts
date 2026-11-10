import { CreateOneInputType } from "@ptc-org/nestjs-query-graphql";
import { InputType } from "@nestjs/graphql";
import { CreateUserInput } from "./create-user.input";

@InputType()
export class CreateOneUserInput extends
    CreateOneInputType('user', CreateUserInput) {

}

