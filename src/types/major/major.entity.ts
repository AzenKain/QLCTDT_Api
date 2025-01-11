import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user';
import { ProgramDetailEntity } from '../program';

@Entity({ name: 'Major' })
export class MajorEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    majorId: string;

    @Column()
    majorName: string;

    @OneToMany(() => UserEntity, (it) => it.pastMajor)
    pastUser: Relation<UserEntity[]>;

    @OneToMany(() => UserEntity, (it) => it.currentMajor)
    currentUser: Relation<UserEntity[]>;

    @OneToMany(() => UserEntity, (it) => it.secondMajor)
    secondUser: Relation<UserEntity[]>;

    @OneToMany(() => ProgramDetailEntity, (program) => program.major)
    programs:  Relation<ProgramDetailEntity[]>;

    @Column({ type: 'longtext', nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: true })
    isDisplay: boolean;

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;
}