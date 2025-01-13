import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchEventDto {
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : value))
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : value))
  endTime?: Date;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? new Date(value) : value))
  schoolYearId?: number

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => (value ? Number(value) : value))
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => (value ? Number(value) : value))
  count?: number;
}

export class GetEventCurrentDto {
  @IsNotEmpty()
  @IsString()
  eventType: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => (value ? new Date(value) : value))
  schoolYearId: number
}