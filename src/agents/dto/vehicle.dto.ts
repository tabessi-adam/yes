import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { VehicleType } from '../../vehicles/entities/vehicle-type.enum';

export class VehicleDto {
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsEnum(VehicleType)
  @IsNotEmpty()
  type: VehicleType;

  @IsNumber()
  @IsNotEmpty()
  pricePerDay: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;
} 