import { IsDateString, IsISO8601, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSchoolYearDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  schoolYearId: string;

  @IsNotEmpty()
  @IsString()
  schoolYearName: string;

  @IsNotEmpty()
  @IsDateString()
  startYear: Date;

  @IsNotEmpty()
  @IsDateString()
  endYear: Date;
}