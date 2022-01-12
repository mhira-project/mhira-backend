import {
    FilterableField,
} from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Patient } from 'src/modules/patient/models/patient.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Caregiver } from './caregiver.model';


@ObjectType()
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

    @ManyToOne(() => Caregiver, caregiver => caregiver.patientCaregivers)
    caregiver: Caregiver;

    @ManyToOne(() => Patient, patient => patient.patientCaregivers)
    patient: Patient;

}
