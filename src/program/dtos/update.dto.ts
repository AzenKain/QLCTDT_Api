import { IsArray, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  programName?: string;

  @IsOptional()
  @IsNumber()
  @MinLength(2)
  majorId?: number;

  @IsOptional()
  @IsNumber()
  @MinLength(2)
  schoolYearId?: number;

  @IsOptional()
  @IsArray()
  generalSubjects?: number[];

  @IsOptional()
  @IsArray()
  coreSubjects?: number[];

  @IsOptional()
  @IsArray()
  majorRequiredSubjects?: number[];

  @IsOptional()
  @IsArray()
  majorElectiveSubjects?: number[];

  @IsOptional()
  @IsArray()
  internshipOrGraduationSubjects?: number[];

  @IsOptional()
  @IsArray()
  freeElectiveSubjects?: number[];
}