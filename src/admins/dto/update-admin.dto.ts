import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class UpdateAdminDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  companyAddress?: string;

  @IsString()
  @IsOptional()
  companyPhone?: string;
} 