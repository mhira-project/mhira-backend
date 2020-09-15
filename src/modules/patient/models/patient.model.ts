import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { GenderEnum } from "./gender.enum";

@ObjectType()
@Entity()
export class Patient extends BaseEntity {

    static searchable = [
        'medicalRecordNo',
        'firstName',
        'middleName',
        'lastName',
        'phone',
        'email',
        'address',
    ];

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: true })
    active: boolean;

    @Field({ nullable: true })
    @Column({ nullable: true, unique: true })
    medicalRecordNo: string;

    @Field()
    @Column()
    firstName: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    middleName: string;

    @Field()
    @Column()
    lastName: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    phone: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    email: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    address: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    gender: GenderEnum;

    @Field({ nullable: true })
    @Column({ nullable: true })
    birthDate: Date;

    @Field({ nullable: true })
    @Column({ type: 'char', length: 2, nullable: true })
    birthCountryCode: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    nationality: string;

    // meta: json;

}
