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
} from 'typeorm';
import { FilterableField, KeySet } from '@nestjs-query/query-graphql';

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

    @Field()
    @Column()
    creator: string;

    @Field()
    @Column()
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
}
