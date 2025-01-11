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
import { SubjectEntity } from '../subject';

@Entity({ name: 'Department' })
export class DepartmentEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    departmentId: string;

    @Column()
    departmentName: string;

    @Column({ type: 'longtext', nullable: true })
    description?: string;

    @OneToMany(() => UserEntity, (it) => it.department)
    lecturer: Relation<UserEntity[]>

    @OneToMany(() => SubjectEntity, (it) => it.department)
    subjects: Relation<SubjectEntity[]>

    @Column({ type: 'boolean', default: true })
    isDisplay: boolean;

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;
}