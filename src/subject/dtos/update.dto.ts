import { IsArray, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  subjectId: string;

  @IsOptional()
  @IsString()
  subjectName: string;

  @IsOptional()
  @IsNumber()
  credits: number;

  @IsOptional()
  @IsNumber()
  theoreticalHours: number;

  @IsOptional()
  @IsNumber()
  practicalHours: number;

  @IsOptional()
  @IsArray()
  prerequisiteCourses: number[]

  @IsOptional()
  @IsArray()
  equivalentCourses: number[]

  @IsOptional()
  @IsNumber()
  coefficient: number;

  @IsOptional()
  @IsNumber()
  departmentId: number;
}