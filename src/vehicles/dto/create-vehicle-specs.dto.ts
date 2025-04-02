import { IsString, IsNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { FuelType } from '../enums/fuel-type.enum';
import { Transmission } from '../enums/transmission.enum';

export class CreateVehicleSpecsDto {
  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  @IsNotEmpty()
  seats: number;

  @IsNumber()
  @IsNotEmpty()
  doors: number;

  @IsNumber()
  @IsNotEmpty()
  luggageCapacity: number;

  @IsEnum(FuelType)
  @IsNotEmpty()
  fuelType: FuelType;

  @IsEnum(Transmission)
  @IsNotEmpty()
  transmission: Transmission;

  @IsNumber()
  @IsNotEmpty()
  engineSize: number;

  @IsNumber()
  @IsNotEmpty()
  power: number;

  @IsNumber()
  @IsNotEmpty()
  torque: number;

  @IsNumber()
  @IsNotEmpty()
  acceleration: number;

  @IsNumber()
  @IsNotEmpty()
  topSpeed: number;
} 