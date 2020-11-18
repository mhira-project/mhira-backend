import { ObjectType, Field, Int, GraphQLISODateTime } from '@nestjs/graphql';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToMany,
    JoinTable, OneToMany
} from 'typeorm';
import { Permission } from 'src/modules/permission/models/permission.model';
import { AccessToken } from 'src/modules/auth/models/access-token.model';
import { GenderEnum } from 'src/modules/patient/models/gender.enum';
import { PatientCaseManager } from 'src/modules/patient/models/patient-case-manager.model';
import { PatientInformant } from 'src/modules/patient/models/patient-informant.model';
import { FilterableField, KeySet, Relation } from '@nestjs-query/query-graphql';
import { Role } from 'src/modules/permission/models/role.model';

@ObjectType()
@KeySet(['id'])
@Relation('roles', () => [Role])
@Relation('permissions', () => [Permission])
@Entity()
export class User extends BaseEntity {

    static searchable = [
        'firstName',
        'middleName',
        'lastName',
        'email',
        'phone',
        'workID',
        'address',
    ];

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column({ unique: true, comment: 'Login Username' })
    username: string;

    @Column({ comment: 'Hashed password' })
    password: string;

    @FilterableField({ nullable: true, defaultValue: true })
    @Column({ default: true })
    active?: boolean;

    @FilterableField()
    @Column()
    firstName: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    middleName?: string;

    @FilterableField()
    @Column()
    lastName: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    email?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    phone?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true, unique: true })
    workID?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    address?: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    gender?: GenderEnum;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    birthDate?: Date;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    nationality?: string;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    @Column({ nullable: true })
    passwordExpiresAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToMany(() => Permission, permission => permission.users)
    @JoinTable({ name: 'user_permission' })
    permissions: Permission[];

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({ name: 'user_role' })
    roles: Role[];

    @OneToMany(() => AccessToken, token => token.user)
    accessTokens: AccessToken[];

    @OneToMany(() => PatientCaseManager, (patientCaseManager) => patientCaseManager.caseManager)
    patientToCaseManager: PatientCaseManager[];

    @OneToMany(() => PatientInformant, (patientToInformant) => patientToInformant.informant)
    patientToInformant: PatientInformant[];

}
