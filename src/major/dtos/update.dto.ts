import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMajorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  majorId?: string;

  @IsOptional()
  @IsString()
  majorName?: string;
}