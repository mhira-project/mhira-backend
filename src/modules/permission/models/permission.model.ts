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
import { FilterableField, UnPagedRelation } from '@nestjs-query/query-graphql';
import { User } from 'src/modules/user/models/user.model';

@ObjectType()
@UnPagedRelation('roles', () => Role, {
    disableRemove: true,
    disableUpdate: true,
})
@UnPagedRelation('users', () => User, {
    disableRemove: true,
    disableUpdate: true,
})
@Entity()
export class Permission extends BaseEntity {
    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column()
    name: string;

    @FilterableField()
    @Column({ default: 'default' })
    group: string;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToMany(
        () => Role,
        role => role.permissions,
        { onDelete: 'CASCADE' },
    )
    roles: Role[];

    @ManyToMany(
        () => User,
        user => user.permissions,
    )
    users: User[];
}
