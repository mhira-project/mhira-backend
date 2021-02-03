import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from "typeorm";
import { User } from './user.model';

@Entity()
export class UserPreviousPassword extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({ comment: 'previous hashed password' })
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.previousPasswords)
    user: User;

}
