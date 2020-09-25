import { ObjectType, Field, Int } from '@nestjs/graphql';
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
import { Patient } from 'src/modules/patient/models/patient.model';

@ObjectType()
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

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true, comment: 'Login Username' })
  username: string;

  @Column({ comment: 'Hashed password' })
  password: string;

  @Field({ nullable: true, defaultValue: true })
  @Column({ default: true })
  active?: boolean;

  @Field()
  @Column()
  firstName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  middleName?: string;

  @Field()
  @Column()
  lastName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, unique: true })
  workID?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  gender?: GenderEnum;

  @Field({ nullable: true })
  @Column({ nullable: true })
  birthDate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nationality?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({ name: 'user_permission' })
  permissions: Permission[];

  @OneToMany(() => AccessToken, token => token.user)
  accessTokens: AccessToken[];

  @ManyToMany(() => Patient, (patient) => patient.caseManagers)
  patients: Patient[];

}
