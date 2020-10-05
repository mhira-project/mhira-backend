import { createUnionType, Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ListItem } from "./list-item.model";
import { Questionnaire } from "./questionnaire.model";

export enum ListOrder {
    SORTED = 'sorted',
    RANDOM = 'random',
}

registerEnumType(ListOrder, { name: 'ListOrder' });

@Entity('questionnaire_list')
export class List extends BaseEntity {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Int)
    @Column()
    questionnaireId: number;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column()
    order: ListOrder;

    @ManyToOne(() => Questionnaire, questionnaire => questionnaire.lists)
    questionnaire: Questionnaire;

    @OneToMany(() => ListItem, item => item.list)
    items: ListItem[]

}
