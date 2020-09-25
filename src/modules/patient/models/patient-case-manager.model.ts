import { ObjectType } from "@nestjs/graphql";
import { User } from "src/modules/user/models/user.model";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Patient } from "./patient.model";

@ObjectType()
@Entity('patient_case_manager')
@Unique('uq_patient_case_managers', ['patientId', 'clinicianId'])
export class PatientCaseManager extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    patientId: number;

    @Column()
    clinicianId: number;

    @ManyToOne(() => Patient)
    patient: Patient;

    @ManyToOne(() => User)
    clinician: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}
