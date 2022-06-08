import { FilterableField, UnPagedRelation } from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
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
import { AssessmentTypeEnum } from '../enums/assessment-type.enum';
import { Assessment } from './assessment.model';

@ObjectType()
@Entity()
export class AssessmentType extends BaseEntity {
    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column()
    name: string;

    @FilterableField()
    @Column({ default: AssessmentTypeEnum.ACTIVE })
    status: AssessmentTypeEnum;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @OneToMany(
        () => Assessment,
        assessment => assessment.assessmentType,
    )
    assessments: Assessment[];
}
