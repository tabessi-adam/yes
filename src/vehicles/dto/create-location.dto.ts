import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
} 