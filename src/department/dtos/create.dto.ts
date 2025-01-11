import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  departmentId: string;

  @IsNotEmpty()
  @IsString()
  departmentName: string;
}