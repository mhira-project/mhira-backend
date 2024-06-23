import { FilterableField } from '@nestjs-query/query-graphql';
import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Consent extends BaseEntity {
    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column()
    name: string;

    @Field(() => String)
    @Column()
    consent1: string;

    @Field(() => String, { nullable: true })
    @Column()
    consent2: string;

    @Field(() => String, { nullable: true })
    @Column()
    consent3: string;

    @Field(() => String, { nullable: true })
    @Column()
    consent4: string;

    @Field(() => String, { nullable: true })
    @Column()
    consent5: string;

    @Field(() => String, { nullable: true })
    @Column()
    consent6: string;

    @Field(() => String, { nullable: true })
    @Column()
    consent7: string;

    @Field(() => String, { nullable: true })
    @Column()
    title: string;

    @Field(() => String, { nullable: true })
    @Column()
    acceptLabel: string;

    @Field(() => String, { nullable: true })
    @Column()
    submitLabel: string;

    @Field(() => String)
    @Column()
    description: string;

    @Field(() => String, { nullable: true })
    @Column()
    submitContent: string;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @UpdateDateColumn()
    updatedAt?: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @CreateDateColumn()
    createdAt?: Date;
}
