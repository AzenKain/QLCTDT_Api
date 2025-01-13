import { IsArray, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateProgramDto {
  @IsNotEmpty()
  @IsString()
  programName: string;

  @IsNotEmpty()
  @IsNumber()
  majorId: number;

  @IsNotEmpty()
  @IsNumber()
  schoolYearId: number;

  @IsNotEmpty()
  @IsArray()
  generalSubjects: number[];

  @IsNotEmpty()
  @IsArray()
  coreSubjects: number[];

  @IsNotEmpty()
  @IsArray()
  majorRequiredSubjects: number[];

  @IsNotEmpty()
  @IsArray()
  majorElectiveSubjects: number[];

  @IsNotEmpty()
  @IsArray()
  internshipOrGraduationSubjects: number[];

  @IsNotEmpty()
  @IsArray()
  freeElectiveSubjects: number[];
}