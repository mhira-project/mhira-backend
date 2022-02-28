import {
    FilterableField, FilterableRelation,
} from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Role } from 'src/modules/permission/models/role.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Report } from './report.model';



@ObjectType()
@FilterableRelation('role', () => Role, { nullable: true })
@FilterableRelation('report', () => Report, { nullable: true })
@Entity()
export class ReportRole extends BaseEntity {
    @FilterableField(() => Int, { nullable: true })
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @FilterableField()
    @Column({ type: "int" })
    roleId: number;

    @FilterableField()
    @Column({ type: "int" })
    reportId: number;

    @ManyToOne(() => Role, role => role.reportRoles)
    role: Role;

    @ManyToOne(() => Report, report => report.reportRoles)
    report: Report;

}
