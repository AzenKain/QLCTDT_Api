import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { RoleEntity } from '../role';
import { ClassEntity } from '../class';
import { MajorEntity } from '../major';
import { DepartmentEntity } from '../department';
import { SchoolYearEntity } from '../schoolYear';
import { ProgramStatusHistoryEntity } from '../program';


@Entity({ name: 'User' })
export class UserEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    userId: string;

    @Column({ unique: true })
    secretKey: string;

    @Column({ type: 'boolean', default: true })
    isDisplay: boolean;

    @ManyToOne(() => RoleEntity, (pd) => pd.users, { nullable: true })
    role?: Relation<RoleEntity>;

    @ManyToOne(() => ClassEntity, (pd) => pd.users, { nullable: true })
    class?: Relation<ClassEntity>;

    @ManyToOne(() => MajorEntity, (pd) => pd.pastUser, { nullable: true })
    pastMajor?: Relation<MajorEntity>;

    @ManyToOne(() => MajorEntity, (pd) => pd.currentUser, { nullable: true })
    currentMajor?: Relation<MajorEntity>;

    @ManyToOne(() => MajorEntity, (pd) => pd.secondUser, { nullable: true })
    secondMajor?: Relation<MajorEntity>;

    @ManyToOne(() => DepartmentEntity, (pd) => pd.lecturer, { nullable: true })
    department?: Relation<DepartmentEntity>;

    @Column()
    position: string;

    @ManyToOne(() => SchoolYearEntity, (pd) => pd.users, { nullable: true })
    schoolYear?: Relation<SchoolYearEntity>;

    @OneToMany(() => ProgramStatusHistoryEntity, (program) => program.user)
    programsHistory: Relation<ProgramStatusHistoryEntity[]>;

    @Column()
    hash: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({nullable: true})
    phoneNumber?: string;

    @Column({nullable: true})
    birthday?: Date;

    @Column({nullable: true})
    gender?: string;

    @Column({nullable: true})
    imgDisplay?: string

    @Column({nullable: true})
    refreshToken?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}