import { FilterableField, Relation } from '@nestjs-query/query-graphql';
import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Patient } from 'src/modules/patient/models/patient.model';
//import { Questionnaire } from 'src/modules/questionnaire/models/questionnaire.model';
import { User } from 'src/modules/user/models/user.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@ObjectType()
//@Relation('questionnaires', () => Questionnaire)
@Relation('patient', () => Patient)
@Relation('clinician', () => User)
@Relation('informant', () => User)
@Entity()
export class Assessment extends BaseEntity {
    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    @Column({ nullable: true })
    date?: Date;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    name: string;

    @FilterableField(() => Int)
    @Column()
    patientId: number;

    @FilterableField(() => Int, { nullable: true })
    @Column({ nullable: true })
    clinicianId?: number;

    @FilterableField(() => Int, { nullable: true })
    @Column({ nullable: true })
    informantId?: number;

    @FilterableField({ nullable: true })
    @Column({ default: 'PENDING' })
    status: string;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToOne(
        () => Patient,
        patient => patient.assessments,
    )
    patient: Patient;

    @ManyToOne(() => User)
    clinician: User;

    @ManyToOne(() => User)
    informant: User;

    /* @ManyToMany(
        () => Questionnaire,
        questionnaire => questionnaire.assessments,
    )
    @JoinTable({ name: 'assessment_questionnaire' })
    questionnaires: Questionnaire[];*/
}
