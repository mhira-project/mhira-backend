import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import {
    BaseEntity,
    Column,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Disclaimer extends BaseEntity {
    @Field(() => String)
    @PrimaryColumn()
    type: string;

    @Field(() => String)
    @Column()
    description: string;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @UpdateDateColumn()
    updatedAt?: Date;
}
