import {
    BaseEntity,
    PrimaryGeneratedColumn,
    Entity,
    Column,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { Field, Int, ObjectType, HideField } from '@nestjs/graphql';
import { User } from 'src/modules/user/models/institution-user.model';
import { InstitutionType } from './institution-type.enum';


@ObjectType({ description: 'Financial Institution participating in the scheme.' })
@Entity()
export class Institution extends BaseEntity {

    static searchable = [
        'code',
        'name',
        'address',
    ];

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: InstitutionType.OTHER })
    type: InstitutionType;

    @Field()
    @Column({ type: 'char', length: 4 })
    code: string;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column({ default: true })
    enabled?: boolean;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    address?: string;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    email?: string;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    phone?: string;

    @Field({ nullable: true })
    @DeleteDateColumn()
    deletedAt?: Date;

    @Field({ nullable: true })
    @Column({ nullable: true })
    meta?: string;

    @HideField()
    @OneToMany(() => User, user => user.institution)
    users: User[];

}
