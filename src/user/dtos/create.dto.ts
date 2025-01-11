import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  userId: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
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

  @IsNotEmpty()
  @IsNumber()
  roleId: number;
}