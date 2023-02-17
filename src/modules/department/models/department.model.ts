import { ObjectType, Int, GraphQLISODateTime, Field } from '@nestjs/graphql';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { FilterableField, FilterableUnPagedRelation, KeySet } from '@nestjs-query/query-graphql';
import { User } from 'src/modules/user/models/user.model';
import { Patient } from 'src/modules/patient/models/patient.model';
import { MailTemplate } from 'src/modules/mail/models/mail-template.model';

@ObjectType()
@KeySet(['id'])
@FilterableUnPagedRelation('users', () => User, { disableUpdate: true, disableRemove: true })
@FilterableUnPagedRelation('patients', () => Patient, { disableUpdate: true, disableRemove: true })
@FilterableUnPagedRelation('mailTemplates', () => MailTemplate, { disableUpdate: true, disableRemove: true })
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

    @ManyToMany(() => MailTemplate, mailTemplate => mailTemplate.departments)
    @JoinTable({ name: 'department_mail_template' })
    mailTemplates: MailTemplate[]
}
