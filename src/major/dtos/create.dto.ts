import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateMajorDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  majorId: string;

  @IsNotEmpty()
  @IsString()
  majorName: string;
}