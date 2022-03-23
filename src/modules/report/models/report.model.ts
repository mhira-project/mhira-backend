import {
    FilterableField,
    QueryOptions,
    UnPagedRelation,
} from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Role } from 'src/modules/permission/models/role.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { SortDirection } from '@nestjs-query/core';

@ObjectType()
@UnPagedRelation('roles', () => Role)
@Entity()
@QueryOptions({
    defaultSort: [{ field: 'createdAt', direction: SortDirection.DESC }],
})
export class Report extends BaseEntity {
    static searchable = [
        'id',
        'anonymus',
        'name',
        'description',
        'status',
        'repositoryLink',
        'appName',
        'url',
        'createdAt',
        'updatedAt',
        'reportRoles'
    ];

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => Boolean, { nullable: true })
    @Column({ nullable: true })
    anonymus?: boolean;

    @FilterableField(() => String)
    @Column({ nullable: false })
    name: string;

    @FilterableField(() => String)
    @Column({ nullable: false })
    resources: string;

    @FilterableField(() => String)
    @Column({ nullable: false })
    description: string;

    @FilterableField(() => Boolean, { nullable: true })
    @Column({ nullable: true })
    status?: boolean;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    repositoryLink?: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    appName?: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    url?: string;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(
        () => Role,
        role => role.reports,
        { onDelete: 'CASCADE', cascade: true },
    )
    @JoinTable({ name: 'report_role' })
    roles: Role[];
}
