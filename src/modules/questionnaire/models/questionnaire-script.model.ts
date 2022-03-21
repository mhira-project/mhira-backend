import { ObjectType, Int, GraphQLISODateTime, Field } from '@nestjs/graphql';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToMany,
    JoinColumn,
    JoinTable,
} from 'typeorm';
import { FilterableField, UnPagedRelation } from '@nestjs-query/query-graphql';
import { Report } from 'src/modules/report/models/report.model';

@ObjectType()
@Entity()
@UnPagedRelation('reports', () => Report, { nullable: false })
export class QuestionnaireScript extends BaseEntity {
    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column()
    name: string;

    @Field()
    @Column()
    scriptText: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    version: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    creator: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    repositoryLink: string;

    @Field(() => String)
    @Column()
    questionnaireId: string;

    @Field(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToMany(
        () => Report,
        report => report.id,
    )
    @JoinTable({ name: 'questionnaire_script_report' })
    reports: Report[];
}
