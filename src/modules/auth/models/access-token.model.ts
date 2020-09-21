import { access } from 'fs';
import { User } from 'src/modules/user/models/user.model';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';


@Entity()
export class AccessToken extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: number;

    @Column({ default: false })
    isRevoked: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    expiresAt: Date;

    @ManyToOne(() => User, user => user.accessTokens)
    user: User;

}
