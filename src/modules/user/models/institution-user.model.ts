import { BaseUser } from "./base-user.model";
import { ChildEntity, Column, ManyToOne, OneToMany } from "typeorm";
import { Field, Int, HideField, ObjectType } from "@nestjs/graphql";
import { Institution } from "src/modules/institution/models/institution.model";
import { UserType } from "./user-type.enum";

@ObjectType()
@ChildEntity(UserType.USER)
export class User extends BaseUser {

    @Field(() => Int)
    @Column({ type: 'integer', unsigned: true, nullable: true })
    institutionId: number;

    @HideField()
    @ManyToOne(() => Institution, institution => institution.users)
    institution: Institution;

}
