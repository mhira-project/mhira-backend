import {
    FilterableField, FilterableUnPagedRelation,
} from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ReportRole } from './report-role.model';


@ObjectType()
@FilterableUnPagedRelation('reportRoles', () => ReportRole, { nullable: true })
@Entity()
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

    @OneToMany(() => ReportRole, reportRole => reportRole.report)
    reportRoles: ReportRole[];
}
