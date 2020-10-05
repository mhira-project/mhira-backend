import { ObjectType, Field, Int } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { List } from "./list.model";


@ObjectType()
@Entity('questionnaire_list_item')
export class ListItem extends BaseEntity {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Int)
    @Column()
    listId: number;

    @Field()
    @Column()
    value: string;

    @Field()
    @Column()
    label: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    shortcut?: string;

    @ManyToOne(() => List, list => list.items)
    list: List;
}
