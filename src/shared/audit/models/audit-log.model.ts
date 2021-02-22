import { ObjectType, Int, GraphQLISODateTime } from '@nestjs/graphql';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn,
} from 'typeorm';
import { FilterableField, KeySet } from '@nestjs-query/query-graphql';
import { EventType } from '../enums/event-type.enum';

@ObjectType()
@KeySet(['id'])
@Entity()
export class AuditLog extends BaseEntity {

    @FilterableField(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @FilterableField()
    @Column()
    eventType: EventType;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    userId: number;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    targetType: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    targetId: number;


    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    sourceIp: string;

    @FilterableField({ nullable: true })
    @Column({ nullable: true })
    description: string;

    @FilterableField({ nullable: true })
    @Column({ type: 'text', nullable: true })
    original: string;

    @FilterableField({ nullable: true })
    @Column({ type: 'text', nullable: true })
    changes: string;

    @FilterableField(() => GraphQLISODateTime)
    @CreateDateColumn()
    createdAt: Date;

}
