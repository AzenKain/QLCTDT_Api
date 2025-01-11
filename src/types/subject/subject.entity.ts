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
import { DepartmentEntity } from '../department';
import { ProgramDetailEntity, ProgramEntity } from '../program';


@Entity({ name: 'Subject' })
export class SubjectEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    subjectId: string;

    @Column()
    subjectName: string;

    @Column({ type: 'longtext', nullable: true })
    description?: string;

    @Column({ type: 'int', default: 0 })
    credits: number;

    @Column({ type: 'int', default: 0 })
    theoreticalHours: number;

    @Column({ type: 'int', default: 0 })
    practicalHours: number;

    @ManyToMany(() => SubjectEntity, { nullable: true })
    @JoinTable({
        name: 'subject_prerequisite',
        joinColumn: { name: 'subjectId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'prerequisiteId', referencedColumnName: 'id' },
    })
    prerequisiteCourses?: SubjectEntity[];

    @ManyToMany(() => SubjectEntity, { nullable: true })
    @JoinTable({
        name: 'subject_equivalent',
        joinColumn: { name: 'subjectId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'equivalentId', referencedColumnName: 'id' },
    })
    equivalentCourses?: SubjectEntity[];

    @Column({ type: 'float', default: 1.0 })
    coefficient: number;

    @ManyToOne(() => DepartmentEntity, (pd) => pd.subjects, { nullable: true })
    department?: Relation<DepartmentEntity>;

    @ManyToMany(() => ProgramDetailEntity, (program) => program.generalSubjects, { nullable: true })
    programs?: Relation<ProgramDetailEntity[]>;

    @ManyToMany(() => ProgramDetailEntity, (program) => program.coreSubjects, { nullable: true })
    programsCore?: Relation<ProgramDetailEntity[]>;

    @ManyToMany(() => ProgramDetailEntity, (program) => program.majorRequiredSubjects, { nullable: true })
    programsMajorRequired?: Relation<ProgramDetailEntity[]>;

    @ManyToMany(() => ProgramDetailEntity, (program) => program.majorElectiveSubjects, { nullable: true })
    programsMajorElective?: Relation<ProgramDetailEntity[]>;

    @ManyToMany(() => ProgramDetailEntity, (program) => program.internshipOrGraduationSubjects, { nullable: true })
    programsInternshipOrGraduation?: Relation<ProgramDetailEntity[]>;

    @ManyToMany(() => ProgramDetailEntity, (program) => program.freeElectiveSubjects, { nullable: true })
    programsFreeElective?: Relation<ProgramDetailEntity[]>;

    @Column({ type: 'boolean', default: true })
    isDisplay: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
