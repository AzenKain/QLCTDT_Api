import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  departmentId?: string;

  @IsOptional()
  @IsString()
  departmentName?: string;
}