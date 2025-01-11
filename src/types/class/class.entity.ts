import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user';

@Entity({ name: 'Class' })
export class ClassEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    classId: string;

    @Column()
    className: string;

    @OneToMany(() => UserEntity, (it) => it.class)
    users: Relation<UserEntity[]>;

    @Column({ type: 'longtext', nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: true })
    isDisplay: boolean;

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;
}