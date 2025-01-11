import { IsDateString, IsNotEmpty, IsString, MinLength } from 'class-validator';
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
  @Transform(({ value }) => (value ? new Date(value) : value))
  startYear: Date;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : value))
  endYear: Date;
}