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
  JoinTable,
  TableInheritance,
} from 'typeorm';
import { Permission } from 'src/modules/permission/models/permission.model';
import { UserType } from './user-type.enum';

@ObjectType()
@Entity({ name: 'user' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class BaseUser extends BaseEntity {

  static searchable = [
    'name',
    'email',
    'phone',
  ];

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ default: UserType.USER })
  type: UserType;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column({ comment: 'Hashed password' })
  password: string;

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

}
