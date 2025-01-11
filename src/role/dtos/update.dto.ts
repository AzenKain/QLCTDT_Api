import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';



export class UpdatePersonalRuleDto {
  @IsOptional()
  @IsBoolean()
  viewPersonalInformation?: boolean;

  @IsOptional()
  @IsBoolean()
  login?: boolean;

  @IsOptional()
  @IsBoolean()
  logout?: boolean;

  @IsOptional()
  @IsBoolean()
  changePassword?: boolean;

  @IsOptional()
  @IsBoolean()
  forgotPassword?: boolean;
}

export class UpdateInformationLookupRuleDto {
  @IsOptional()
  @IsBoolean()
  viewProgram?: boolean;

  @IsOptional()
  @IsBoolean()
  createProgram?: boolean;

  @IsOptional()
  @IsBoolean()
  importProgram?: boolean;

  @IsOptional()
  @IsBoolean()
  duplicateProgram?: boolean;

  @IsOptional()
  @IsBoolean()
  viewEquivalentSubject?: boolean;

  @IsOptional()
  @IsBoolean()
  lookupEquivalentSubject?: boolean;

  @IsOptional()
  @IsBoolean()
  viewProgramDraft?: boolean;

  @IsOptional()
  @IsBoolean()
  editProgramDraft?: boolean;

  @IsOptional()
  @IsBoolean()
  deleteProgramDraft?: boolean;

  @IsOptional()
  @IsBoolean()
  sendApprovalRequest?: boolean;

  @IsOptional()
  @IsBoolean()
  viewApprovalRequest?: boolean;

  @IsOptional()
  @IsBoolean()
  approveRequest?: boolean;

  @IsOptional()
  @IsBoolean()
  viewApprovalHistory?: boolean;
}

export class UpdateAdministrationRuleDto {
  @IsOptional()
  @IsBoolean()
  viewClass?: boolean;

  @IsOptional()
  @IsBoolean()
  lookupClass?: boolean;

  @IsOptional()
  @IsBoolean()
  createClass?: boolean;

  @IsOptional()
  @IsBoolean()
  editClass?: boolean;

  @IsOptional()
  @IsBoolean()
  viewSchoolYear?: boolean;

  @IsOptional()
  @IsBoolean()
  lookupSchoolYear?: boolean;

  @IsOptional()
  @IsBoolean()
  createSchoolYear?: boolean;

  @IsOptional()
  @IsBoolean()
  editSchoolYear?: boolean;

  @IsOptional()
  @IsBoolean()
  viewUserGroup?: boolean;

  @IsOptional()
  @IsBoolean()
  lookupUserGroup?: boolean;

  @IsOptional()
  @IsBoolean()
  createUserGroup?: boolean;

  @IsOptional()
  @IsBoolean()
  editUserGroup?: boolean;

  @IsOptional()
  @IsBoolean()
  deleteUserGroup?: boolean;

  @IsOptional()
  @IsBoolean()
  viewDepartment?: boolean;

  @IsOptional()
  @IsBoolean()
  lookupDepartment?: boolean;

  @IsOptional()
  @IsBoolean()
  createDepartment?: boolean;

  @IsOptional()
  @IsBoolean()
  editDepartment?: boolean;

  @IsOptional()
  @IsBoolean()
  viewMajor?: boolean;

  @IsOptional()
  @IsBoolean()
  lookupMajor?: boolean;

  @IsOptional()
  @IsBoolean()
  createMajor?: boolean;

  @IsOptional()
  @IsBoolean()
  editMajor?: boolean;

  @IsOptional()
  @IsBoolean()
  viewUser?: boolean;

  @IsOptional()
  @IsBoolean()
  lookupUser?: boolean;

  @IsOptional()
  @IsBoolean()
  filterUser?: boolean;

  @IsOptional()
  @IsBoolean()
  createUser?: boolean;

  @IsOptional()
  @IsBoolean()
  editUser?: boolean;

  @IsOptional()
  @IsBoolean()
  viewSubject?: boolean;

  @IsOptional()
  @IsBoolean()
  lookupSubject?: boolean;

  @IsOptional()
  @IsBoolean()
  importSubjectFromExcel?: boolean;

  @IsOptional()
  @IsBoolean()
  assignPermission?: boolean;

  @IsOptional()
  @IsBoolean()
  manageEvent?: boolean;
}


export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  roleId?: string;

  @IsOptional()
  @IsString()
  roleName?: string;

  @IsOptional()
  personalRule?: UpdatePersonalRuleDto;

  @IsOptional()
  informationLookupRule?: UpdateInformationLookupRuleDto;

  @IsOptional()
  administrationRule?: UpdateAdministrationRuleDto;

  @IsOptional()
  @IsString()
  description?: string;
}