import { BaseEntity, Column, PrimaryColumn } from "typeorm";

export class Setting extends BaseEntity {

    @PrimaryColumn()
    key: string;

    @Column({ nullable: true })
    value: string;
}
