import { IsNotEmpty, IsString } from 'class-validator';

export class StatusProgramDto {
  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  note: string;
}