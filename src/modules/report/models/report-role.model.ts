import {
    FilterableField, FilterableRelation,
} from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Patient } from 'src/modules/patient/models/patient.model';
import { Role } from 'src/modules/permission/models/role.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { Report } from './report.model';



@ObjectType()
@FilterableRelation('role', () => Role, { nullable: true })
@FilterableRelation('report', () => Report, { nullable: true })
@Unique(["roleId", "reportId"])
@Entity()
export class ReportRole extends BaseEntity {
    @FilterableField(() => Int, { nullable: true })
    @PrimaryGeneratedColumn()
    id: number;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

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
    Role: Role;

    @ManyToOne(() => Report, report => report.reportRoles)
    report: Report;

}
