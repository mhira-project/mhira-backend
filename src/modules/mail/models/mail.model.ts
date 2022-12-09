import { FilterableField } from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { MailModule } from '../enums/mail-module.enum';

@ObjectType()
@Entity()
export class Mail extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column({ nullable: false })
    name: string;

    @Field(() => String)
    @Column()
    subject: string;

    @Field(() => String)
    @Column()
    body: string;

    @FilterableField(() => String, { nullable: true })
    @Column({ default: MailModule.ACTIVE })
    module: string;
}