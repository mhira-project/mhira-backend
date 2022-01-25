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
import { PatientCaregiver } from './patient-caregiver.model';

@ObjectType()
@FilterableUnPagedRelation('patientCaregivers', () => PatientCaregiver, { nullable: true })
@Entity()
export class Caregiver extends BaseEntity {
    static searchable = [
        'id',
        'emergencyContact',
        'firstName',
        'middleName',
        'lastName',
        'email',
        'phone',
        'deletedAt',
        'createdAt',
        'updatedAt',
        'patientCaregivers',
    ];

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => Boolean)
    @Column({ default: false })
    emergencyContact: boolean;

    @FilterableField(() => String)
    @Column({ nullable: true })
    firstName: string;

    @FilterableField(() => String)
    @Column({ nullable: true })
    middleName: string;

    @FilterableField(() => String)
    @Column({ nullable: true })
    lastName: string;

    @FilterableField(() => String)
    @Column({ nullable: true })
    email: string;

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

    @OneToMany(() => PatientCaregiver, patientCaregiver => patientCaregiver.caregiver)
    patientCaregivers: PatientCaregiver[];
}
