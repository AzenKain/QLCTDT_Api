import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSubjectDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  subjectId: string;

  @IsNotEmpty()
  @IsString()
  subjectName: string;

  @IsNotEmpty()
  @IsNumber()
  credits: number;

  @IsNotEmpty()
  @IsNumber()
  theoreticalHours: number;

  @IsNotEmpty()
  @IsNumber()
  practicalHours: number;

  @IsNotEmpty()
  @IsArray()
  prerequisiteCourses: number[]

  @IsNotEmpty()
  @IsArray()
  equivalentCourses: number[]

  @IsNotEmpty()
  @IsNumber()
  coefficient: number;

  @IsNotEmpty()
  @IsNumber()
  departmentId: number;
}