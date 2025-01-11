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
import { ProgramDetailEntity, ProgramEntity } from '../program';
import { EventEntity } from '../event';


@Entity({ name: 'SchoolYear' })
export class SchoolYearEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    schoolYearId: string;

    @Column()
    schoolYearName: string;

    @Column()
    startYear: Date;

    @Column()
    endYear: Date;

    @OneToMany(() => UserEntity, (it) => it.schoolYear)
    users: Relation<UserEntity[]>;

    @OneToMany(() => ProgramDetailEntity, (program) => program.schoolYear)
    programs: Relation<ProgramDetailEntity[]>;

    @OneToMany(() => EventEntity, (event) => event.schoolYear)
    events: Relation<EventEntity[]>;

    @Column({ type: 'longtext', nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: true })
    isDisplay: boolean;

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;
}