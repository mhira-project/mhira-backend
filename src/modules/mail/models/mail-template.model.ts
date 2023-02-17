import { FilterableField, FilterableUnPagedRelation } from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AssessmentTypeEnum } from 'src/modules/assessment/enums/assessment-type.enum';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { Department } from 'src/modules/department/models/department.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { TemplateModuleEnum } from '../enums/template-module.enum';

@ObjectType()
@FilterableUnPagedRelation('departments', () => Department)
@Entity()
export class MailTemplate extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ nullable: false })
    name: string;

    @Field(() => String)
    @Column()
    subject: string;

    @Field(() => String)
    @Column()
    body: string;

    @FilterableField()
    @Column({ default: AssessmentTypeEnum.ACTIVE })
    status: AssessmentTypeEnum;

    @FilterableField()
    @Column()
    module: TemplateModuleEnum;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @Field({ defaultValue: false })
    @Column()
    isPublic: boolean;

    @ManyToMany(() => Department, department => department.mailTemplates)
    departments: Department;

    @OneToMany(() => Assessment, assessment => assessment.mailTemplate)
    assessments: Assessment[]
}