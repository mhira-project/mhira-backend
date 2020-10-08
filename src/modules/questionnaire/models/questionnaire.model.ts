import { FilterableField } from "@nestjs-query/query-graphql";
import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
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

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column()
    name: string;

    @FilterableField()
    @Column()
    version: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    abbreviation?: string;

    @FilterableField()
    @Column()
    language?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    timeToComplete?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    description?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    copyright?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    license?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    website?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    references?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    icd10?: string;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
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
