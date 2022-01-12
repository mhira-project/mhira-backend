import {
    FilterableField,
    FilterableRelation,
    FilterableUnPagedRelation,
} from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { Department } from 'src/modules/department/models/department.model';
import { User } from 'src/modules/user/models/user.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { EmergencyContact } from './emergency-contact.model';
import { GenderEnum } from './gender.enum';
import { Informant } from './informant.model';
import { PatientStatus } from './patient-status.model';

@ObjectType()
@FilterableRelation('status', () => PatientStatus, {
    nullable: true,
    disableUpdate: true,
})
@FilterableUnPagedRelation('caseManagers', () => User, { nullable: true })
@FilterableUnPagedRelation('informants', () => Informant, { nullable: true })
@FilterableUnPagedRelation('emergencyContacts', () => EmergencyContact, { nullable: true })
@FilterableUnPagedRelation('departments', () => Department, { nullable: true })
@Entity()
export class Patient extends BaseEntity {
    static searchable = [
        'medicalRecordNo',
        'firstName',
        'middleName',
        'lastName',
        'phone',
        'email',
        'address',
    ];

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField({
        deprecationReason: 'Replaced with status field relation',
    })
    @Column({ default: true })
    active: boolean;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    statusId: number;

    @FilterableField({ nullable: true })
    @Column({ nullable: true, unique: true })
    medicalRecordNo: string;

    @FilterableField()
    @Column()
    firstName: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    middleName: string;

    @FilterableField()
    @Column()
    lastName: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    phone: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    phone2: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    email: string;

    @FilterableField({
        nullable: true,
        deprecationReason: 'Replaced with address subfields',
    })
    @Column({ nullable: true })
    address: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    addressStreet: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    addressNumber: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    addressApartment: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    addressPlace: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    addressPostalCode: string;

    @FilterableField({ nullable: true })
    @Column({ type: 'char', length: 2, nullable: true })
    addressCountryCode: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    gender: GenderEnum;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'date', nullable: true })
    birthDate: Date;

    @FilterableField({ nullable: true })
    @Column({ type: 'char', length: 2, nullable: true })
    birthCountryCode: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    nationality: string;

    @FilterableField()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @ManyToOne(
        () => PatientStatus,
        status => status.patients,
    )
    status: PatientStatus;

    @ManyToMany(
        () => User,
        user => user.patients,
    )
    @JoinTable({ name: 'patient_case_manager' })
    caseManagers: User[];

    @ManyToMany(
        () => Department,
        department => department.patients,
    )
    @JoinTable({ name: 'patient_department' })
    departments: Department[];

    @OneToMany(
        () => Informant,
        informant => informant.patient,
        { onDelete: 'CASCADE' },
    )
    informants: Informant[];

    @OneToMany(
        () => EmergencyContact,
        contact => contact.patient,
        { onDelete: 'CASCADE' },
    )
    emergencyContacts: EmergencyContact[];

    @OneToMany(
        () => Assessment,
        assessment => assessment.patient,
    )
    assessments: Assessment[];
}

@ObjectType()
export class QuestionnaireChoice {
    @Field(() => String)
    _id: string;
    @Field(() => String)
    label: string;
    @Field(() => String)
    name: string;
}

@ObjectType()
class AnswerChoiceLabel {
    @Field(() => String)
    label: string;
    @Field(() => String)
    name: string

}

@ObjectType()
class AnsweredQuestions {
    @Field(() => String)
    answerValue: string;
    @Field(() => [AnswerChoiceLabel])
    answerChoiceLabel: AnswerChoiceLabel[];
    @Field(() => String)
    createdAt: string;
    @Field(() => String)
    updatedAt: string;
    @Field(() => String)
    name: "string";
    @Field(() => String)
    label: "Little interest or pleasure in doing things?";
    @Field(() => String)
    type: "select_one";
    @Field(() => String)
    hint: "Over the last two weeks, how often have you been bothered by any of the following problems?";
    @Field(() => Boolean)
    required: boolean;
}

@ObjectType()
export class AnsweredQuestionnaire {
    @Field(() => String)
    assessmentId: string;
    @Field(() => String)
    _id: string;
    @FilterableField()
    status: string;
    @Field(() => Date)
    createdAt: Date;
    @Field(() => String)
    copyright: string;
    @Field(() => String)
    language: string;
    @Field(() => String)
    name: string;
    @Field(() => String)
    questionnaireFullName: string;
    @Field(() => [QuestionnaireChoice])
    choices: QuestionnaireChoice[];
    @Field(() => [AnsweredQuestions])
    answeredQuestions: AnsweredQuestions[];
}
@ObjectType()
export class PatientReport extends Patient {
    @Field(() => AnsweredQuestionnaire)
    answeredQuestionnaire: AnsweredQuestionnaire;
}
