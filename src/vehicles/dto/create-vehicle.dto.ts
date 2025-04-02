import { IsString, IsNotEmpty, IsNumber, IsEnum, IsDateString, IsArray, IsOptional } from 'class-validator';
import { VehicleType } from '../entities/vehicle-type.enum';
import { Location } from '../entities/location.entity';
import { VehicleSpecs } from '../entities/vehicle-specs.entity';
import { VehicleFeatures } from '../entities/vehicle-features.entity';

export class CreateVehicleDto {
  @IsNumber()
  @IsNotEmpty()
  officeId: number; // Added to match office relation

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

  @IsDateString()
  @IsNotEmpty()
  availableFrom: string; // Using string for ISO date format

  @IsDateString()
  @IsNotEmpty()
  availableTo: string; // Using string for ISO date format

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  images: string[];

  @IsNotEmpty()
  currentLocation: Location; // Single object

  @IsNotEmpty()
  specs: VehicleSpecs; // Single object

  @IsNotEmpty()
  features: VehicleFeatures; // Single object
}