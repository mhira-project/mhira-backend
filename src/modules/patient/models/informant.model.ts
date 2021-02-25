import { FilterableField, Relation } from "@nestjs-query/query-graphql";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Patient } from "./patient.model";
import { RelationshipType } from "./relationship-type.model";

@ObjectType()
@Relation('patient', () => Patient,
    {
        nullable: true,
        disableUpdate: true,
        disableRemove: true
    }
)
@Relation('relationshipType', () => RelationshipType,
    {
        nullable: true,
        disableUpdate: true,
        disableRemove: true
    }
)
@Entity()
export class Informant extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column()
    patientId: number;

    @FilterableField()
    @Column()
    firstName: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    middleName: string;

    @FilterableField()
    @Column()
    lastName: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    phone: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    email: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    address: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    relationshipTypeId: number;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToOne(() => Patient, patient => patient.informants, { onDelete: 'CASCADE' })
    patient: Patient;

    @ManyToOne(() => RelationshipType)
    relationshipType: RelationshipType;

}
