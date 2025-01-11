import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn,
    ManyToOne,
    OneToMany, OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user';

@Entity({ name: 'PersonalRule' })
export class PersonalRuleEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'boolean', default: true })
    viewPersonalInformation: boolean;

    @Column({ type: 'boolean', default: true })
    login: boolean;

    @Column({ type: 'boolean', default: true })
    logout: boolean;

    @Column({ type: 'boolean', default: true })
    changePassword: boolean;

    @Column({ type: 'boolean', default: true })
    forgotPassword: boolean;

    @OneToOne(() => RoleEntity, (role) => role.personalRule, { nullable: true })
    role: Relation<RoleEntity>;
}

@Entity({ name: 'InformationLookupRule' })
export class InformationLookupRuleEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'boolean', default: false })
    viewProgram: boolean;

    @Column({ type: 'boolean', default: false })
    createProgram: boolean;

    @Column({ type: 'boolean', default: false })
    importProgram: boolean;

    @Column({ type: 'boolean', default: false })
    duplicateProgram: boolean;

    @Column({ type: 'boolean', default: false })
    viewEquivalentSubject: boolean;

    @Column({ type: 'boolean', default: false })
    lookupEquivalentSubject: boolean;

    @Column({ type: 'boolean', default: false })
    viewProgramDraft: boolean;

    @Column({ type: 'boolean', default: false })
    editProgramDraft: boolean;

    @Column({ type: 'boolean', default: false })
    deleteProgramDraft: boolean;

    @Column({ type: 'boolean', default: false })
    sendApprovalRequest: boolean;

    @Column({ type: 'boolean', default: false })
    viewApprovalRequest: boolean;

    @Column({ type: 'boolean', default: false })
    approveRequest: boolean;

    @Column({ type: 'boolean', default: false })
    viewApprovalHistory: boolean;

    @OneToOne(() => RoleEntity, (role) => role.informationLookupRule, { nullable: true })
    role: Relation<RoleEntity>;
}

@Entity({ name: 'AdministrationRule' })
export class AdministrationRuleEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'boolean', default: false })
    viewClass: boolean;

    @Column({ type: 'boolean', default: false })
    lookupClass: boolean;

    @Column({ type: 'boolean', default: false })
    createClass: boolean;

    @Column({ type: 'boolean', default: false })
    editClass: boolean;

    @Column({ type: 'boolean', default: false })
    viewSchoolYear: boolean;

    @Column({ type: 'boolean', default: false })
    lookupSchoolYear: boolean;

    @Column({ type: 'boolean', default: false })
    createSchoolYear: boolean;

    @Column({ type: 'boolean', default: false })
    editSchoolYear: boolean;

    @Column({ type: 'boolean', default: false })
    viewUserGroup: boolean;

    @Column({ type: 'boolean', default: false })
    lookupUserGroup: boolean;

    @Column({ type: 'boolean', default: false })
    createUserGroup: boolean;

    @Column({ type: 'boolean', default: false })
    editUserGroup: boolean;

    @Column({ type: 'boolean', default: false })
    deleteUserGroup: boolean;

    @Column({ type: 'boolean', default: false })
    viewDepartment: boolean;

    @Column({ type: 'boolean', default: false })
    lookupDepartment: boolean;

    @Column({ type: 'boolean', default: false })
    createDepartment: boolean;

    @Column({ type: 'boolean', default: false })
    editDepartment: boolean;

    @Column({ type: 'boolean', default: false })
    viewMajor: boolean;

    @Column({ type: 'boolean', default: false })
    lookupMajor: boolean;

    @Column({ type: 'boolean', default: false })
    createMajor: boolean;

    @Column({ type: 'boolean', default: false })
    editMajor: boolean;

    @Column({ type: 'boolean', default: false })
    viewUser: boolean;

    @Column({ type: 'boolean', default: false })
    lookupUser: boolean;

    @Column({ type: 'boolean', default: false })
    filterUser: boolean;

    @Column({ type: 'boolean', default: false })
    createUser: boolean;

    @Column({ type: 'boolean', default: false })
    editUser: boolean;

    @Column({ type: 'boolean', default: false })
    viewSubject: boolean;

    @Column({ type: 'boolean', default: false })
    createSubject: boolean;

    @Column({ type: 'boolean', default: false })
    lookupSubject: boolean;

    @Column({ type: 'boolean', default: false })
    editSubject: boolean;

    @Column({ type: 'boolean', default: false })
    importSubjectFromExcel: boolean;

    @Column({ type: 'boolean', default: false })
    assignPermission: boolean;

    @Column({ type: 'boolean', default: false })
    manageEvent: boolean;

    @OneToOne(() => RoleEntity, (role) => role.administrationRule, { nullable: true })
    role: Relation<RoleEntity>;
}


@Entity({ name: 'Role' })
export class RoleEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ unique: true })
    roleId: string;

    @Column()
    roleName: string;

    @OneToOne(() => PersonalRuleEntity, (it) => it.role)
    @JoinColumn()
    personalRule: Relation<PersonalRuleEntity>;

    @OneToOne(() => InformationLookupRuleEntity, (rule) => rule.role)
    @JoinColumn()
    informationLookupRule: Relation<InformationLookupRuleEntity>;

    @OneToOne(() => AdministrationRuleEntity, (rule) => rule.role)
    @JoinColumn()
    administrationRule: Relation<AdministrationRuleEntity>;

    @OneToMany(() => UserEntity, (it) => it.role)
    users: Relation<UserEntity[]>;

    @Column({ type: 'boolean', default: true })
    isDisplay: boolean;

    @Column({ type: 'longtext', nullable: true })
    description?: string;

    @CreateDateColumn()
    createdAt: Date;
        
    @UpdateDateColumn()
    updatedAt: Date;
}