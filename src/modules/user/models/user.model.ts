import {ObjectType, Int, GraphQLISODateTime, Field} from '@nestjs/graphql';
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
    OneToMany,
} from 'typeorm';
import {Permission} from 'src/modules/permission/models/permission.model';
import {AccessToken} from 'src/modules/auth/models/access-token.model';
import {GenderEnum} from 'src/modules/patient/models/gender.enum';
import {
    FilterableField,
    KeySet,
    FilterableUnPagedRelation,
    UnPagedRelation,
} from '@nestjs-query/query-graphql';
import {Role} from 'src/modules/permission/models/role.model';
import {UserPreviousPassword} from './user-previous-password.model';
import {Department} from 'src/modules/department/models/department.model';
import {Patient} from 'src/modules/patient/models/patient.model';

@ObjectType()
@KeySet(['id'])
@FilterableUnPagedRelation('roles', () => Role)
@UnPagedRelation('permissions', () => Permission)
@FilterableUnPagedRelation('departments', () => Department)
@Entity({synchronize: true})
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
    @Column({default: false})
    isSuperUser: boolean;

    @Field()
    @Column({default: false})
    acceptedTerm: boolean;

    @FilterableField()
    @Column({unique: true, comment: 'Login Username'})
    username: string;

    @Column({comment: 'Hashed password'})
    password: string;

    @FilterableField({nullable: true, defaultValue: true})
    @Column({default: true})
    active?: boolean;

    @FilterableField()
    @Column()
    firstName: string;

    @FilterableField({nullable: true})
    @Column({nullable: true})
    middleName?: string;

    @FilterableField()
    @Column()
    lastName: string;

    @FilterableField({nullable: true})
    @Column({nullable: true})
    email?: string;

    @FilterableField({nullable: true})
    @Column({nullable: true})
    phone?: string;

    @FilterableField({nullable: true})
    @Column({nullable: true})
    workID?: string;

    @FilterableField({nullable: true})
    @Column({nullable: true})
    address?: string;

    @FilterableField({nullable: true})
    @Column({nullable: true})
    gender?: GenderEnum;

    @FilterableField({nullable: true})
    @Column({nullable: true})
    birthDate?: Date;

    @FilterableField({nullable: true})
    @Column({nullable: true})
    nationality?: string;

    @FilterableField(() => GraphQLISODateTime, {nullable: true})
    @Column({nullable: true})
    passwordExpiresAt: Date;

    @OneToMany(
        () => UserPreviousPassword,
        password => password.user,
        {onDelete: 'CASCADE'},
    )
    previousPasswords: UserPreviousPassword[];

    @Column({default: 0, nullable: true})
    failedLoginAttempts: number;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

    @FilterableField(() => GraphQLISODateTime)
    @UpdateDateColumn()
    updatedAt: Date;

    @FilterableField(() => GraphQLISODateTime, {nullable: true})
    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToMany(
        () => Permission,
        permission => permission.users,
    )
    @JoinTable({name: 'user_permission'})
    permissions: Permission[];

    @ManyToMany(
        () => Role,
        role => role.users,
    )
    @JoinTable({name: 'user_role'})
    roles: Role[];

    @ManyToMany(
        () => Department,
        department => department.users,
    )
    @JoinTable({name: 'user_department'})
    departments: Department[];

    @ManyToMany(
        () => Patient,
        patient => patient.caseManagers,
    )
    patients: Patient[];

    @OneToMany(
        () => AccessToken,
        token => token.user,
        {onDelete: 'CASCADE'},
    )
    accessTokens: AccessToken[];

}
