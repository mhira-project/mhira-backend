import { FilterableField } from '@nestjs-query/query-graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { TemplateModule } from '../enums/template-module.enum';

@ObjectType()
@Entity()
export class MailTemplate extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField(() => String)
    @Column({ nullable: false })
    name: string;

    @Field(() => String)
    @Column()
    subject: string;

    @Field(() => String)
    @Column()
    body: string;

    @FilterableField(() => Boolean)
    @Column({ default: true })
    status: boolean;

    @FilterableField(() => String)
    @Column()
    module: string;
}