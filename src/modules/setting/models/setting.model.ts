import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Setting extends BaseEntity {
    @PrimaryColumn()
    key: string;

    @Column({ nullable: true })
    value: string;
}
