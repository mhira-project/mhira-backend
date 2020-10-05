import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Assessment } from "src/modules/assessment/models/assessment.model";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { List } from "./list.model";
import { Question } from "./question.model";

@ObjectType()
@Entity()
export class Questionnaire extends BaseEntity {

    static searchable = [
        'name',
        'abbreviation',
        'language',
        'description',
        'copyright',
        'license',
        'website',
        'references',
        'icd10',
    ];

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column()
    version: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    abbreviation?: string;

    @Field()
    @Column()
    language?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    timeToComplete?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    copyright?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    license?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    website?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    references?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    icd10?: string;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    // localAdaptation
    // screeningOrDiagnosis

    @OneToMany(() => Question, question => question.questionnaire)
    questions: Question[];

    @OneToMany(() => List, list => list.questionnaire)
    lists: List[];

    @ManyToMany(() => Assessment, assessment => assessment.questionnaires)
    assessments: Assessment[]

}
