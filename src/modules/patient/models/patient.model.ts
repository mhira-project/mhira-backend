import { FilterableField } from "@nestjs-query/query-graphql";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Assessment } from "src/modules/assessment/models/assessment.model";
import { User } from "src/modules/user/models/user.model";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GenderEnum } from "./gender.enum";
import { PatientCaseManager } from "./patient-case-manager.model";
import { PatientInformant } from "./patient-informant.model";

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

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column({ default: true })
    active: boolean;

    @FilterableField({ nullable: true })
    @Column({ nullable: true, unique: true })
    medicalRecordNo: string;

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
    gender: GenderEnum;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    birthDate: Date;

    @FilterableField({ nullable: true })
    @Column({ type: 'char', length: 2, nullable: true })
    birthCountryCode: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    nationality: string;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @OneToMany(() => PatientCaseManager, (patientCaseManager) => patientCaseManager.patient)
    patientToCaseManager: PatientCaseManager[];

    @ManyToMany(() => PatientInformant, (oatientInformant) => oatientInformant.patient)
    patientToInformant: PatientInformant[];

    @OneToMany(() => Assessment, (assessment) => assessment.patient)
    assessments: Assessment;

}
