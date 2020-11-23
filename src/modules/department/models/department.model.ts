import { ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';
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
import { FilterableField, KeySet, Relation } from '@nestjs-query/query-graphql';
import { User } from 'src/modules/user/models/user.model';

@ObjectType()
@KeySet(['id'])
@Relation('users', () => [User], { disableUpdate: true, disableRemove: true })
@Entity()
export class Department extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column({ unique: true, comment: 'Department Name' })
    name: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    description?: string;

    @FilterableField({ nullable: true, defaultValue: true })
    @Column({ default: true })
    active?: boolean;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToMany(() => User, user => user.departments)
    users: User[];

}
