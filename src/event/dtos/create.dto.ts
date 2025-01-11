import { IsDateString, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  eventType: string;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : value))
  startTime: Date;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : value))
  endTime: Date;

  @IsNotEmpty()
  @IsNumber()
  schoolYearId: number
}