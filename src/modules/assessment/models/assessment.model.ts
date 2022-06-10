import {
    FilterableField,
    FilterableRelation,
} from '@nestjs-query/query-graphql';
import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { Patient } from 'src/modules/patient/models/patient.model';
import { User } from 'src/modules/user/models/user.model';
import { QuestionnaireAssessment } from '../../questionnaire/models/questionnaire-assessment.schema';
import {
    BaseEntity,
    BeforeInsert,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AssessmentInformant } from '../enums/assessment-informant.enum';
import { AssessmentType } from './assessment-type.model';

@ObjectType()
@FilterableRelation('patient', () => Patient)
@FilterableRelation('clinician', () => User, { nullable: true })
@FilterableRelation('informantClinician', () => User, { nullable: true })
@FilterableRelation('assessmentType', () => AssessmentType, { nullable: true })
@Entity()
export class Assessment extends BaseEntity {
    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column({ nullable: false })
    questionnaireAssessmentId: string;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    @Column({ nullable: true })
    date?: Date;

    // @FilterableField({ nullable: true })
    // @Column({ nullable: true })
    // name: string;

    @FilterableField(() => Int)
    @Column()
    patientId: number;

    @FilterableField(() => Int, { nullable: true })
    @Column({ nullable: true })
    clinicianId?: number;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true, default: AssessmentInformant.PATIENT })
    informantType?: string;

    @FilterableField({ nullable: true })
    @Column({ default: 'PLANNED' })
    status: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    note: string;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @Column({ nullable: true })
    expirationDate?: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @Column({ nullable: true })
    deliveryDate?: Date;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    informantCaregiverRelation?: string;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @Field(() => Boolean)
    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'varchar', nullable: true })
    uuid: string;

    @BeforeInsert()
    private generateUuid() {
        this.uuid = uuidv4();
    }

    @ManyToOne(
        () => Patient,
        patient => patient.assessments,
    )
    patient: Patient;

    @ManyToOne(() => User)
    clinician: User;

    @ManyToOne(() => User)
    informantClinician: User;

    @ManyToOne(
        () => AssessmentType,
        assessmentType => assessmentType.assessments,
    )
    assessmentType: AssessmentType;
}

@ObjectType()
export class FullAssessment extends Assessment {
    @Field(() => QuestionnaireAssessment)
    questionnaireAssessment: QuestionnaireAssessment;

    @Field(() => User)
    clinician: User;

    @Field(() => Patient)
    patient: Patient;

    @Field(() => User, { nullable: true })
    informantClinician: User;

    @Field(() => AssessmentType, { nullable: true })
    assessmentType: AssessmentType;
}

@ObjectType()
export class AssessmentResponse extends Assessment {
    @Field(() => String)
    assessmentId: string;
}
