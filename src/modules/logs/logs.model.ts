import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../user/models/user.model";
import { FilterableField, FilterableRelation } from "@nestjs-query/query-graphql";

@ObjectType()
@FilterableRelation('user', () => User, { nullable: true })
@Entity()
export class Logs extends BaseEntity {
    @FilterableField()
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column()
    operation: string;

    @FilterableField(() => String)
    @Column()
    operationType: string;

    @FilterableField(() => String)
    @Column()
    returnType: string;

    @FilterableField(() => String)
    @Column()
    userAgent: string;

    @FilterableField(() => String)
    @Column()
    ipAddress: string;

    @Field(() => Int)
    @Column()
    responseTime: number;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    queryResult: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    mutationVariables: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    errorMessage: string;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
        () => User,
        user => user.logs,
    )
    user: User
}