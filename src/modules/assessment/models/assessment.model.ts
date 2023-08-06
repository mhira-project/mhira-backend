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
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AssessmentInformant } from '../enums/assessment-informant.enum';
import { AssessmentType } from './assessment-type.model';
import { MailTemplate } from 'src/modules/mail/models/mail-template.model';

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

    @FilterableField(() => Int, { nullable: true })
    @Column()
    assessmentTypeId?: number;

    @FilterableField(() => String, { nullable: true })
    @Column({ nullable: true, default: AssessmentInformant.PATIENT })
    informantType?: string;

    @FilterableField({ nullable: true })
    @Column({ default: 'PLANNED' })
    status: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    note: string;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    @Column({ nullable: true })
    expirationDate?: Date;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    @Column({ nullable: true })
    deliveryDate?: Date;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    @Column({ nullable: true })
    submissionDate?: Date;

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

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    deleted: boolean

    @Field(() => Boolean)
    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @FilterableField(() => String, { nullable: true })
    @Column({ type: 'varchar', nullable: true })
    uuid: string;

    @Field(() => Boolean)
    @Column()
    emailReminder?: boolean;

    @FilterableField(() => String)
    @Column()
    emailStatus?: string;

    @Field(() => String, { nullable: true })
    @Column()
    receiverEmail?: string;

    @Field(() => Int, { nullable: true })
    @Column()
    mailTemplateId: number

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

    @ManyToOne(
        () => MailTemplate,
        mailTemplate => mailTemplate.assessments,
    )
    mailTemplate: MailTemplate
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
export class FullPublicAssessment {
    @Field(() => Int)
    id: number;

    @Field(() => String, { nullable: true })
    uuid: string;

    @Field(() => GraphQLISODateTime, { nullable: true })
    date?: Date;

    @Field({ nullable: true })
    status: string;

    @Field(() => GraphQLISODateTime)
    createdAt: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    deletedAt: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    deliveryDate: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    expirationDate: Date;
    
    @Field(() => String, { nullable: true })
    informantType?: string;

    @Field(() => QuestionnaireAssessment)
    questionnaireAssessment: QuestionnaireAssessment;

    @Field(() => AssessmentType, { nullable: true })
    assessmentType: AssessmentType;
}

@ObjectType()
export class AssessmentResponse extends Assessment {
    @Field(() => String)
    assessmentId: string;

     @Field(() => AssessmentType, { nullable: true })
    assessmentType: AssessmentType;
}
