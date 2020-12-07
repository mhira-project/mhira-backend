import { FilterableField, Relation } from "@nestjs-query/query-graphql";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Patient } from "./patient.model";
import { RelationshipType } from "./relationship-type.model";

@ObjectType()
@Relation('patients', () => [Patient],
    {
        nullable: true,
        disableUpdate: true,
        disableRemove: true
    }
)
export class PatientStatus extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column()
    name: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    description: string;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @OneToMany(() => Patient, patient => patient.status)
    patients: Patient[];

}
