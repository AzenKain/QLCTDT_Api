import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  userId: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  position: string;

  @IsOptional()
  @IsNumber()
  schoolYearId?: number;

  @IsOptional()
  @IsNumber()
  classId?: number;

  @IsOptional()
  @IsNumber()
  pastMajorId?: number;

  @IsOptional()
  @IsNumber()
  currentMajorId?: number;

  @IsOptional()
  @IsNumber()
  secondMajorId?: number;

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsNumber()
  roleId: number;
}