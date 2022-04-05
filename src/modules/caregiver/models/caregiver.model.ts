import {
    FilterableField,
    FilterableUnPagedRelation,
} from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PatientCaregiver } from './patient-caregiver.model';

@ObjectType()
@FilterableUnPagedRelation('patientCaregivers', () => PatientCaregiver, {
    nullable: true,
})
@Entity()
export class Caregiver extends BaseEntity {
    static searchable = [
        'id',
        'firstName',
        'middleName',
        'lastName',
        'email',
        'phone',
        'deletedAt',
        'createdAt',
        'updatedAt',
        'patientCaregivers',
        'country',
        'number',
        'postalCode',
        'apartment',
        'place',
        'country',
        'street',
    ];

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ nullable: true })
    firstName: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    middleName?: string;

    @FilterableField(() => String)
    @Column({ nullable: true })
    lastName: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    email?: string;

    @FilterableField(() => String)
    @Column({ nullable: false, unique: true })
    phone: string;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    street?: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    country?: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    place?: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    apartment?: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    postalCode?: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true })
    number?: string;

    @OneToMany(
        () => PatientCaregiver,
        patientCaregiver => patientCaregiver.caregiver,
    )
    patientCaregivers: PatientCaregiver[];
}
