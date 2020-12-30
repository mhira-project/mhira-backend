import { InputType, Field } from "@nestjs/graphql";
import { MaxLength } from "class-validator";
import { GuardType } from "../models/guard-type.enum";

@InputType()
export class RoleInput {

    @MaxLength(15)
    @Field()
    name: string;

    @Field()
    guard: GuardType;

}
