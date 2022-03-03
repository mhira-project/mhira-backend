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
import { FilterableField, KeySet } from '@nestjs-query/query-graphql';
import { Report } from 'src/modules/report/models/report.model';
// import { QuestionnaireScriptReport } from './questionnaire-script-report.model';

@ObjectType()
@Entity()
export class QuestionnaireScript extends BaseEntity {
    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
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

    @Field(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @DeleteDateColumn()
    deletedAt: Date;

    @Field(() => [Report])
    @ManyToMany(
        () => Report,
        report => report.id,
    )
    @JoinTable()
    reports: Report[];
}
