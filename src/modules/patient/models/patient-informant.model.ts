import { ObjectType } from "@nestjs/graphql";
import { User } from "src/modules/user/models/user.model";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Patient } from "./patient.model";

@ObjectType()
@Entity('patient_informant')
// @Index(['patientId', 'informantId'], { unique: true })
export class PatientInformant extends BaseEntity {

    // @PrimaryGeneratedColumn()
    // id: number;

    @PrimaryColumn()
    patientId: number;

    @PrimaryColumn()
    informantId: number;

    @ManyToOne(() => Patient)
    patient: Patient;

    @ManyToOne(() => User)
    informant: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}
