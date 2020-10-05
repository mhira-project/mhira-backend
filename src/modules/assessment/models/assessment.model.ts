import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Questionnaire } from "src/modules/questionnaire/models/questionnaire.model";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Assessment extends BaseEntity {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    date?: Date;

    @Field({ nullable: true })
    @Column({ nullable: true })
    name: string;

    @Field(() => Int)
    @Column()
    patientId: number;

    @Field(() => Int)
    @Column()
    clinicianId: number;

    @Field(() => Int)
    @Column()
    informantId: number;

    @ManyToMany(() => Questionnaire, questionnaire => questionnaire.assessments)
    @JoinTable({ name: 'assessment_questionnaire' })
    questionnaires: Questionnaire[];

}
