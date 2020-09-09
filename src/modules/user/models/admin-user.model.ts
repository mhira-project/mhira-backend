import { BaseUser } from "./base-user.model";
import { ChildEntity } from "typeorm";
import { ObjectType } from "@nestjs/graphql";
import { UserType } from "./user-type.enum";

@ObjectType()
@ChildEntity(UserType.ADMIN)
export class Admin extends BaseUser {

}
