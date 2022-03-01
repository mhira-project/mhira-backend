import {
    FilterableField, FilterableRelation,
} from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Patient } from 'src/modules/patient/models/patient.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { Caregiver } from './caregiver.model';


@ObjectType()
@FilterableRelation('patient', () => Patient, { nullable: true })
@FilterableRelation('caregiver', () => Caregiver, { nullable: true })
@Unique(["patientId", "caregiverId"])
@Entity()
export class PatientCaregiver extends BaseEntity {
    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @FilterableField()
    @Column({ type: "int" })
    patientId: number;

    @FilterableField()
    @Column({ type: "int" })
    caregiverId: number;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    relation: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true, type: "text" })
    note?: string;

    @FilterableField(() => Boolean, { nullable: true })
    @Column({ default: false, nullable: true })
    emergency?: boolean;


    @ManyToOne(() => Caregiver, caregiver => caregiver.patientCaregivers)
    caregiver: Caregiver;

    @ManyToOne(() => Patient, patient => patient.patientCaregivers)
    patient: Patient;

}
