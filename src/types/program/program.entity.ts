import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn, JoinTable, ManyToMany, ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user';
import { SubjectEntity } from '../subject';
import { MajorEntity } from '../major';
import { SchoolYearEntity } from '../schoolYear';

@Entity({ name: 'Program' })
export class ProgramEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @OneToMany(() => ProgramStatusHistoryEntity, (history) => history.program)
    statusHistory: Relation<ProgramStatusHistoryEntity[]>;

    @Column({default: "Created"})
    status: string;

    @Column({ type: 'boolean', default: true })
    isDisplay: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => ProgramDetailEntity, (profile) => profile.programDraft)
    @JoinColumn()
    draft: Relation<ProgramDetailEntity>

    @OneToOne(() => ProgramDetailEntity, (profile) => profile.programRequest, {nullable : true})
    @JoinColumn()
    request: Relation<ProgramDetailEntity>

    @UpdateDateColumn()
    updatedAt: Date;
}

@Entity({ name: 'ProgramDetail' })
export class ProgramDetailEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    programName: string;

    @ManyToOne(() => MajorEntity, (user) => user.programs)
    major: Relation<MajorEntity>;

    @ManyToOne(() => SchoolYearEntity, (user) => user.programs)
    schoolYear: Relation<SchoolYearEntity>

    @Column({ type: 'boolean', default: true })
    isDisplay: boolean;

    @ManyToMany(() => SubjectEntity, (subject) => subject.programs)
    @JoinTable({
        name: 'program_subject',
        joinColumn: { name: 'program_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    })
    generalSubjects: SubjectEntity[];

    @ManyToMany(() => SubjectEntity, (subject) => subject.programsCore)
    @JoinTable({
        name: 'program_core_subject',
        joinColumn: { name: 'program_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    })
    coreSubjects: SubjectEntity[];

    @ManyToMany(() => SubjectEntity, (subject) => subject.programsMajorRequired)
    @JoinTable({
        name: 'program_major_required_subject',
        joinColumn: { name: 'program_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    })
    majorRequiredSubjects: SubjectEntity[];

    @ManyToMany(() => SubjectEntity, (subject) => subject.programsMajorElective)
    @JoinTable({
        name: 'program_major_elective_subject',
        joinColumn: { name: 'program_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    })
    majorElectiveSubjects: SubjectEntity[];

    @ManyToMany(() => SubjectEntity, (subject) => subject.programsInternshipOrGraduation)
    @JoinTable({
        name: 'program_internship_or_graduation',
        joinColumn: { name: 'program_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    })
    internshipOrGraduationSubjects: SubjectEntity[];

    @ManyToMany(() => SubjectEntity, (subject) => subject.programsFreeElective)
    @JoinTable({
        name: 'program_free_elective',
        joinColumn: { name: 'program_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    })
    freeElectiveSubjects: SubjectEntity[];

    @Column({ type: 'longtext', nullable: true })
    description?: string;

    @OneToOne(() => ProgramEntity, (user) => user.draft) // specify inverse side as a second parameter
    programDraft: ProgramEntity

    @OneToOne(() => ProgramEntity, (user) => user.request) // specify inverse side as a second parameter
    programRequest: ProgramEntity
}

@Entity({ name: 'ProgramStatusHistory' })
export class ProgramStatusHistoryEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ nullable: true })
    previousStatus: string;

    @Column({ nullable: false })
    newStatus: string;

    @Column({ nullable: true })
    note?: string;

    @ManyToOne(() => UserEntity, (user) => user.programsHistory, { nullable: true })
    user: Relation<UserEntity>;

    @ManyToOne(() => ProgramEntity, (it) => it.statusHistory)
    program: Relation<ProgramEntity>;

    @CreateDateColumn()
    createdAt: Date;
}