import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BaseEntity,
    Entity,
    ManyToMany,
    JoinTable,
    Column,
    BeforeUpdate,
    BeforeRemove,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Permission } from './permission.model';
import { GuardType } from './guard-type.enum';
import { FilterableField, PagingStrategies, Relation } from '@nestjs-query/query-graphql';
import { User } from 'src/modules/user/models/user.model';

@ObjectType()
@Relation('permissions', () => [Permission], { pagingStrategy: PagingStrategies.NONE })
@Relation('users', () => [User])
@Entity()
export class Role extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column({ default: false })
    isSuperAdmin: boolean;

    @FilterableField()
    @Column()
    name: string;

    @FilterableField()
    @Column()
    guard: GuardType;

    @FilterableField()
    @CreateDateColumn()
    createdAt?: Date;

    @FilterableField()
    @UpdateDateColumn()
    updatedAt?: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToMany(() => Permission, permission => permission.roles)
    @JoinTable({ name: 'role_permission' })
    permissions: Permission[];

    @ManyToMany(() => User, user => user.roles)
    users: User[];

    @BeforeUpdate()
    beforeUpdate() {
        if (this.isSuperAdmin) throw new Error('Cannot update super admin role');
    }

    @BeforeRemove()
    beforeDelete() {
        if (this.isSuperAdmin) throw new Error('Cannot delete super admin role');
    }

}
