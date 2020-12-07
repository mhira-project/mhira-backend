import { FilterableField } from "@nestjs-query/query-graphql";
import {
    Field,
    GraphQLISODateTime,
    Int,
    ObjectType,
} from "@nestjs/graphql";
import {
    Entity,
    BaseEntity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    DeleteDateColumn,
    UpdateDateColumn,
    BeforeInsert,
} from "typeorm";


@ObjectType()
@Entity()
export class Country extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column({ unique: true })
    name: string;

    @FilterableField({ nullable: true })
    @Column({ unique: true, nullable: true })
    code: string;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @DeleteDateColumn()
    deletedAt: Date;

    @BeforeInsert()
    async beforeInsert() {
        this.code = this.code ? this.code.toUpperCase() : null;
    }

}
