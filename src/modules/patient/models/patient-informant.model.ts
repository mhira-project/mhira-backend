import { ObjectType } from "@nestjs/graphql";
import { User } from "src/modules/user/models/user.model";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Patient } from "./patient.model";

@ObjectType()
@Entity('patient_informant')
// @Unique(['patientId', 'informantId'])
export class PatientInformant extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    patientId: number;

    @Column()
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
