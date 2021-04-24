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
import { FilterableField, FilterableRelation, KeySet } from '@nestjs-query/query-graphql';
import { User } from 'src/modules/user/models/user.model';
import { Patient } from 'src/modules/patient/models/patient.model';

@ObjectType()
@KeySet(['id'])
@FilterableRelation('users', () => [User], { disableUpdate: true, disableRemove: true })
@FilterableRelation('patients', () => [Patient], { disableUpdate: true, disableRemove: true })
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

    @ManyToMany(() => Patient, patient => patient.departments)
    patients: User[];

}
