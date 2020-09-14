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
} from 'typeorm';
import { Permission } from 'src/modules/permission/models/permission.model';

@ObjectType()
@Entity({ name: 'user' })
export class User extends BaseEntity {

  static searchable = [
    'name',
    'email',
    'phone',
  ];

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

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
