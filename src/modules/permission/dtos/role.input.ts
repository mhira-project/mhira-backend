import { InputType, Field } from "@nestjs/graphql";
import { Max } from "class-validator";
import { GuardType } from "../models/guard-type.enum";

@InputType()
export class RoleInput {

    @Max(15)
    @Field()
    name: string;

    @Field()
    guard: GuardType;

}
