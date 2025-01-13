import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSchoolYearDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  schoolYearId?: string;

  @IsOptional()
  @IsString()
  schoolYearName?: string;

  @IsOptional()
  @IsDateString()
  startYear?: Date;

  @IsOptional()
  @IsDateString()
  endYear?: Date;
}