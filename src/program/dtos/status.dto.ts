import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StatusProgramDto {
  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsNumber()
  schoolYearId: number;
}