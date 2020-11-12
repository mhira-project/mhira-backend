import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BaseEntity,
    Entity,
    ManyToMany,
    Column,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from './role.model';
import { GuardType } from './guard-type.enum';
import { FilterableField, Relation } from '@nestjs-query/query-graphql';
import { User } from 'src/modules/user/models/user.model';

@ObjectType()
@Relation('roles', () => [Role])
@Relation('users', () => [User])
@Entity()
export class Permission extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column()
    name: string;

    @FilterableField()
    @Column()
    guard: GuardType;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToMany(() => Role, role => role.permissions)
    roles: Role[];

    @ManyToMany(() => User, user => user.permissions)
    users: User[];

}
