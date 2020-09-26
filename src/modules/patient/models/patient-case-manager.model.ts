import { ObjectType } from "@nestjs/graphql";
import { User } from "src/modules/user/models/user.model";
import { BaseEntity, Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Patient } from "./patient.model";

@ObjectType()
@Entity('patient_case_manager')
// @Index(['patientId', 'caseManagerId'], { unique: true })
export class PatientCaseManager extends BaseEntity {

    // @PrimaryGeneratedColumn()
    // id: number;

    @PrimaryColumn()
    patientId: number;

    @PrimaryColumn()
    caseManagerId: number;

    @ManyToOne(() => Patient)
    patient: Patient;

    @ManyToOne(() => User)
    caseManager: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}
