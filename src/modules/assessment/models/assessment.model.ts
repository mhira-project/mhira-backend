import { FilterableField, Relation } from "@nestjs-query/query-graphql";
import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { Questionnaire } from "src/modules/questionnaire/models/questionnaire.model";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Relation('questionnaires', () => Questionnaire)
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

    @ManyToMany(() => Questionnaire, questionnaire => questionnaire.assessments)
    @JoinTable({ name: 'assessment_questionnaire' })
    questionnaires: Questionnaire[];

}
