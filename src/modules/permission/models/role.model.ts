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
import {
    FilterableField,
    PagingStrategies,
    Relation,
} from '@nestjs-query/query-graphql';
import { User } from 'src/modules/user/models/user.model';
import { RoleCode } from '../enums/role-code.enum';
import { MAX_ROLE_HIERARCHY } from '../constants';

@ObjectType()
@Relation('permissions', () => [Permission], {
    pagingStrategy: PagingStrategies.NONE,
})
@Relation('users', () => [User])
@Entity()
export class Role extends BaseEntity {
    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column()
    name: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true, unique: true })
    code: RoleCode;

    @FilterableField()
    @Column({ default: MAX_ROLE_HIERARCHY })
    hierarchy: number;

    @FilterableField()
    @CreateDateColumn()
    createdAt?: Date;

    @FilterableField()
    @UpdateDateColumn()
    updatedAt?: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToMany(
        () => Permission,
        permission => permission.roles,
    )
    @JoinTable({ name: 'role_permission' })
    permissions: Permission[];

    @ManyToMany(
        () => User,
        user => user.roles,
    )
    users: User[];

    @Field()
    get isSuperAdmin(): boolean {
        return this.code === RoleCode.SUPER_ADMIN;
    }

    @Field()
    get isNoRole(): boolean {
        return this.code === RoleCode.NO_ROLE;
    }

    @BeforeUpdate()
    beforeUpdate() {
        if (this.isSuperAdmin)
            throw new Error('Cannot update super admin role');
    }

    @BeforeRemove()
    beforeDelete() {
        if (this.isSuperAdmin)
            throw new Error('Cannot delete super admin role');
    }
}
