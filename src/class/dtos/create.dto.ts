import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  classId: string;

  @IsNotEmpty()
  @IsString()
  className: string;
}